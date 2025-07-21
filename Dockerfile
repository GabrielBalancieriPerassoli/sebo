FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    mariadb-server \
    php-cli \
    php-mysql \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY init.sql /docker-entrypoint-initdb.d/init.sql

COPY . /app

WORKDIR /app

CMD service mariadb start && \
    sleep 3 && \
    mariadb -u root < /docker-entrypoint-initdb.d/init.sql && \
    php -d upload_max_filesize=50M -d post_max_size=50M -S 0.0.0.0:80 -t /app