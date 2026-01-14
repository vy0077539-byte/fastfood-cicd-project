pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📦 CHECKOUT SOURCE CODE'
                git branch: 'main',
                    url: 'https://github.com/vy0077539-byte/fastfood-cicd-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 INSTALLING DEPENDENCIES'
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
            }
        }

        stage('Run Tests (Optional)') {
            steps {
                echo '🧪 RUN TESTS (OPTIONAL)'
                script {
                    sh '''
                        if npm run | grep -q "test"; then
                            echo "Running tests..."
                            npm test
                        else
                            echo "No test script found, skipping tests"
                        fi
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 DEPLOY BACKEND APPLICATION'
                sh '''
                    DEPLOY_DIR="/var/www/fastfood-app"
                    LOG_FILE="/var/log/fastfood-app.log"

                    # Create directories and set permissions
                    sudo mkdir -p $DEPLOY_DIR
                    sudo touch $LOG_FILE
                    sudo chown -R jenkins:jenkins $DEPLOY_DIR $LOG_FILE
                    sudo chmod 664 $LOG_FILE

                    # Copy project files
                    sudo rsync -av --delete ./ $DEPLOY_DIR/
                    sudo chown -R jenkins:jenkins $DEPLOY_DIR

                    cd $DEPLOY_DIR

                    # Install production dependencies
                    npm install --production

                    # Stop old PM2 process if exists
                    pm2 delete fastfood-app || true

                    # Kill any process using port 3000
                    sudo fuser -k 3000/tcp || true

                    # Start app with PM2
                    pm2 start server.js --name fastfood-app --time --max-memory-restart 500M \
                        --log $LOG_FILE --error $LOG_FILE --merge-logs
                    pm2 save

                    echo "✅ Deployment finished"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '💚 HEALTH CHECK'
                sh '''
                    MAX_ATTEMPTS=10
                    ATTEMPT=1
                    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
                        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
                        if [ "$HTTP_CODE" = "200" ]; then
                            echo "✅ Health check passed (HTTP $HTTP_CODE)"
                            break
                        else
                            echo "⏳ Attempt $ATTEMPT/$MAX_ATTEMPTS - Health check HTTP $HTTP_CODE, retrying..."
                            sleep 2
                            ATTEMPT=$((ATTEMPT+1))
                        fi

                        if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
                            echo "❌ Health check failed after $MAX_ATTEMPTS attempts"
                            pm2 logs fastfood-app --lines 20 --nostream
                            exit 1
                        fi
                    done
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 PIPELINE SUCCESSFUL'
            sh 'pm2 list'
        }

        failure {
            echo '❌ PIPELINE FAILED'
            sh 'pm2 logs fastfood-app --lines 30 --nostream || true'
        }

        always {
            echo '🧹 CLEANUP COMPLETE'
        }
    }
}
