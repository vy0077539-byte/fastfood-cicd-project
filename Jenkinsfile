pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    environment {
        APP_NAME   = 'fastfood-app'
        APP_PORT   = '3000'
        DEPLOY_DIR = '/var/www/fastfood-app'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📦 CHECKOUT STAGE'
                git branch: 'main',
                    url: 'https://github.com/vy0077539-byte/fastfood-cicd-project.git'
                echo '✅ Repository cloned successfully'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 INSTALL DEPENDENCIES'
                sh '''
                    node -v
                    npm -v
                    npm install
                '''
                echo '✅ Dependencies installed'
            }
        }

        stage('Run Tests (Optional)') {
            steps {
                echo '🧪 RUN TESTS'
                sh '''
                    if npm run | grep -q "test"; then
                        echo "Running tests..."
                        npm test
                    else
                        echo "No tests found, skipping..."
                    fi
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 DEPLOY APPLICATION'
                sh '''
                    echo "Creating deployment directory..."
                    sudo mkdir -p $DEPLOY_DIR
                    sudo rsync -av --delete ./ $DEPLOY_DIR/
                    sudo chown -R jenkins:jenkins $DEPLOY_DIR

                    cd $DEPLOY_DIR

                    echo "Installing production dependencies..."
                    npm install --production

                    echo "Stopping existing PM2 app (if any)..."
                    pm2 delete $APP_NAME || true

                    echo "Detecting start file..."
                    START_FILE=""
                    for f in server.js index.js app.js; do
                        if [ -f "$f" ]; then
                            START_FILE="$f"
                            break
                        fi
                    done

                    if [ -z "$START_FILE" ]; then
                        echo "❌ ERROR: No entry file found (server.js / index.js / app.js)"
                        exit 1
                    fi

                    echo "Starting app using $START_FILE"
                    pm2 start $START_FILE --name $APP_NAME
                    pm2 save

                    echo "PM2 process started"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '💚 HEALTH CHECK'
                sh '''
                    sleep 5

                    echo "Checking PM2 status..."
                    pm2 list | grep -q "$APP_NAME.*online"

                    echo "Checking application endpoint..."
                    if curl -sf http://localhost:$APP_PORT/health; then
                        echo "✅ Health check passed"
                    else
                        echo "❌ Health check failed"
                        pm2 logs $APP_NAME --lines 20
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 PIPELINE SUCCESS'
            sh 'pm2 list'
        }

        failure {
            echo '❌ PIPELINE FAILED'
            sh 'pm2 logs fastfood-app --lines 30 || true'
        }

        always {
            echo '🧹 CLEANUP COMPLETE'
            echo "⏱️ Build finished: ${currentBuild.currentResult}"
        }
    }
}
