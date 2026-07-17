FROM php:8.3-apache

WORKDIR /var/www/html

COPY . .

RUN docker-php-ext-install mysqli pdo pdo_mysql

RUN a2enmod rewrite
