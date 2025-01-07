#!/bin/bash

# Function to display messages
log() {
    echo -e "\e[32m[INFO]\e[0m $1"
}

log "Starting LEMP stack installation and POS deployment."

# Update and upgrade the system
log "Updating system packages..."
sudo apt update -y && sudo apt upgrade -y

# Install Nginx
log "Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install MySQL
log "Installing MySQL..."
sudo apt install -y mysql-server

# Secure MySQL installation
log "Securing MySQL..."
sudo mysql_secure_installation

# Create a database for Laravel
DB_NAME="pos_db"
DB_USER="pos_user"
DB_PASS="p@55wor0d_7_7_7"

log "Setting up MySQL database and user..."
sudo mysql -e "CREATE DATABASE $DB_NAME;"
sudo mysql -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Install PHP and extensions
log "Installing PHP and extensions..."
# sudo apt install -y php-fpm php-mysql php-cli php-curl php-zip php-mbstring php-xml composer unzip
sudo apt install -y php7.4-fpm php7.4-mysql php7.4-mbstring php7.4-xml php7.4-bcmath php7.4-intl php7.4-cli php7.4-curl php7.4-zip composer unzip

# Configure PHP settings
log "Configuring PHP..."
sudo sed -i "s/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/" /etc/php/*/fpm/php.ini
sudo systemctl restart php*-fpm

# Clone POS application
APP_DIR="/var/www/pos"
REPO_URL="https://github.com/walteranyika/global-pos.git"

log "Cloning POS application..."
sudo apt install -y git
git clone $REPO_URL $APP_DIR
git checkout olukulu

# Set permissions for the POS application
log "Setting permissions for Laravel..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 775 $APP_DIR/storage $APP_DIR/bootstrap/cache $APP_DIR/public/images
sudo chmod -R 777 $APP_DIR/storage/app/public/backup


# Install POS dependencies
log "Installing POS dependencies..."
cd $APP_DIR
composer install --no-dev --optimize-autoloader

# Configure POS environment
log "Configuring POS environment..."
cp .env.example .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
php artisan key:generate
php artisan migrate --seed --force

# Build Vue frontend
log "Building Vue frontend..."
cd $APP_DIR
npm install
npm run dev

sudo rm -R $APP_DIR/resourses/src

# Configure Nginx
NGINX_CONF="/etc/nginx/sites-available/pos"
log "Configuring Nginx..."
sudo cat <<EOL > $NGINX_CONF
server {
    listen 80;
    server_name _;
    root $APP_DIR/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOL

# Enable Laravel Nginx configuration
log "Enabling Nginx configuration for Laravel..."
sudo ln -s /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
sudo systemctl reload nginx

log "POS application deployed successfully!"


#chmod +x deploy.sh
#sudo ./deploy.sh
