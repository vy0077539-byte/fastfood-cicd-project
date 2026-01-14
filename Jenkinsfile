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
                sh '''
                    if npm run | grep -q "test"; then
                        npm test
                    else
                        echo "No test script found, skipping tests"
                    fi
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 DEPLOY BACKEND APPLICATION'
                sh '''
                    APP_NAME="fastfood-app"
                    DEPLOY_DIR="$HOME/fastfood-app"

                    mkdir -p $DEPLOY_DIR
                    rsync -av --delete ./ $DEPLOY_DIR/
                    cd $DEPLOY_DIR

                    npm install --production

                    pm2 delete $APP_NAME || true
                    pm2 flush

                    pm2 start server.js \
                      --name $APP_NAME \
                      --time \
                      --max-memory-restart 500M

                    pm2 save

                    echo "Application deployed successfully"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '💚 HEALTH CHECK'
                sh '''
                    echo "Waiting for app to start..."
                    sleep 10

                    curl -f http://localhost:3000/health
                    echo "Health check passed"
                '''
            }
        }

        /* ============ CLICKABLE LINKS STAGE ============ */

        stage('Application Links') {
            steps {
                sh '''
                    PUBLIC_IP=$(curl -s ifconfig.me)

                    echo "======================================"
                    echo "Application URL"
                    echo "http://$PUBLIC_IP:3000"

                    echo ""
                    echo "Health Check"
                    echo "http://$PUBLIC_IP:3000/health"

                    echo ""
                    echo "API Menu"
                    echo "http://$PUBLIC_IP:3000/api/menu"
                    echo "======================================"
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
