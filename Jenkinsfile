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
                    sudo mkdir -p /var/www/fastfood-app
                    sudo rm -rf /var/www/fastfood-app/*
                    sudo cp -r * /var/www/fastfood-app/
                    sudo chown -R jenkins:jenkins /var/www/fastfood-app

                    cd /var/www/fastfood-app
                    npm install --production

                    echo "Stopping old PM2 process if exists..."
                    pm2 delete fastfood-app || true

                    echo "Starting backend with PM2..."
                    pm2 start server.js --name fastfood-app
                    pm2 save
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '💚 HEALTH CHECK'
                sh '''
                    sleep 5

                    echo "Checking PM2 status..."
                    pm2 list | grep fastfood-app

                    echo "Checking application health endpoint..."
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

                    if [ "$HTTP_CODE" != "200" ]; then
                        echo "Health check failed with HTTP $HTTP_CODE"
                        pm2 logs fastfood-app --lines 20 --nostream
                        exit 1
                    fi

                    echo "Health check passed!"
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 PIPELINE SUCCESSFUL'
            sh '''
                pm2 list
            '''
        }

        failure {
            echo '❌ PIPELINE FAILED'
            sh '''
                pm2 logs fastfood-app --lines 30 --nostream || true
            '''
        }
    }
}
