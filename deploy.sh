#!/bin/bash

# USSS VPS Deployment Script
# This script helps deploy and manage the USSS application on a VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All requirements met"
}

setup_environment() {
    print_info "Setting up environment..."
    
    if [ ! -f .env.production ]; then
        cp .env.production.example .env.production
        print_info "Created .env.production file. Please edit it with your actual values."
        read -p "Press enter to continue after editing .env.production..."
    fi
    
    print_success "Environment configured"
}

setup_ssl() {
    print_info "Setting up SSL certificate..."
    
    if [ -z "$DOMAIN" ]; then
        read -p "Enter your domain name (e.g., example.com): " DOMAIN
    fi
    
    if [ -z "$EMAIL" ]; then
        read -p "Enter your email for Let's Encrypt: " EMAIL
    fi
    
    # Update nginx config with actual domain
    sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" nginx/conf.d/default.conf
    
    # Create directories for certbot
    mkdir -p certbot/conf certbot/www
    
    # Start nginx without SSL first
    print_info "Starting Nginx for certificate validation..."
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    # Get SSL certificate
    print_info "Obtaining SSL certificate from Let's Encrypt..."
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Reload nginx with SSL
    docker-compose -f docker-compose.prod.yml restart nginx
    
    print_success "SSL certificate obtained and configured"
}

build_and_deploy() {
    print_info "Building and deploying application..."
    
    # Build images
    docker-compose -f docker-compose.prod.yml build
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Application deployed successfully!"
        print_info "Your application should be available at https://$DOMAIN"
    else
        print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
}

update_deployment() {
    print_info "Updating deployment..."
    
    # Pull latest changes (if using git)
    if [ -d .git ]; then
        git pull
    fi
    
    # Rebuild and restart
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Deployment updated"
}

show_logs() {
    docker-compose -f docker-compose.prod.yml logs -f
}

stop_services() {
    print_info "Stopping services..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Services stopped"
}

# Main menu
show_menu() {
    echo ""
    echo "==================================="
    echo "   USSS VPS Deployment Manager"
    echo "==================================="
    echo "1. Initial Setup (First time deployment)"
    echo "2. Deploy/Redeploy Application"
    echo "3. Update Deployment (Pull changes and rebuild)"
    echo "4. Setup/Renew SSL Certificate"
    echo "5. View Logs"
    echo "6. Stop Services"
    echo "7. Exit"
    echo "==================================="
    read -p "Select an option: " choice
    
    case $choice in
        1)
            check_requirements
            setup_environment
            setup_ssl
            build_and_deploy
            ;;
        2)
            build_and_deploy
            ;;
        3)
            update_deployment
            ;;
        4)
            setup_ssl
            ;;
        5)
            show_logs
            ;;
        6)
            stop_services
            ;;
        7)
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Run menu
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        setup)
            check_requirements
            setup_environment
            setup_ssl
            build_and_deploy
            ;;
        deploy)
            build_and_deploy
            ;;
        update)
            update_deployment
            ;;
        ssl)
            setup_ssl
            ;;
        logs)
            show_logs
            ;;
        stop)
            stop_services
            ;;
        *)
            echo "Usage: $0 {setup|deploy|update|ssl|logs|stop}"
            exit 1
            ;;
    esac
fi
