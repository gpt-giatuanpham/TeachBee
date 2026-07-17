FROM php:8.2-apache

COPY . /var/www/html/

RUN a2dismod mpm_prefork && a2enmod mpm_event

RUN docker-php-ext-install mysqli pdo_mysql
