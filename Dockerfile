FROM php:8.2-apache

COPY . /var/www/html/

# Disable conflicting MPM modules before Apache starts
RUN a2dismod mpm_prefork mpm_worker
RUN a2enmod mpm_event

RUN docker-php-ext-install mysqli pdo_mysql
