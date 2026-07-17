FROM php:8.2-apache

COPY . /var/www/html/

# Disable mpm_prefork and mpm_worker by commenting out their LoadModule directives
RUN sed -i 's/^LoadModule mpm_prefork_module/#LoadModule mpm_prefork_module/' /etc/apache2/mods-available/mpm_prefork.load && \
    sed -i 's/^LoadModule mpm_worker_module/#LoadModule mpm_worker_module/' /etc/apache2/mods-available/mpm_worker.load && \
    a2enmod mpm_event

RUN docker-php-ext-install mysqli pdo_mysql
