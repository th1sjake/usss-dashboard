# 🚀 Инструкция по развертыванию USSS на VPS

## 📋 Содержание
1. [Подготовка VPS](#подготовка-vps)
2. [Первоначальная настройка](#первоначальная-настройка)
3. [Развертывание приложения](#развертывание-приложения)
4. [Настройка автоматического обновления](#настройка-автоматического-обновления)
5. [Управление приложением](#управление-приложением)
6. [Решение проблем](#решение-проблем)

---

## 🖥️ Подготовка VPS

### Минимальные требования:
- **ОС**: Ubuntu 20.04/22.04 или Debian 11/12
- **RAM**: минимум 2GB (рекомендуется 4GB)
- **Диск**: минимум 20GB
- **CPU**: 2 ядра

### 1. Подключитесь к VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2. Обновите систему
```bash
apt update && apt upgrade -y
```

### 3. Установите Docker
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Запуск Docker при старте системы
systemctl enable docker
systemctl start docker

# Проверка установки
docker --version
```

### 4. Установите Docker Compose
```bash
# Установка Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker-compose --version
```

### 5. Установите Git
```bash
apt install git -y
```

### 6. Настройте файрвол (UFW)
```bash
# Установка UFW (если не установлен)
apt install ufw -y

# Разрешить SSH
ufw allow 22/tcp

# Разрешить HTTP и HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Включить файрвол
ufw enable
```

---

## 🔧 Первоначальная настройка

### 1. Настройте домен
Перед развертыванием убедитесь, что ваш домен указывает на IP вашего VPS:
- Создайте **A-запись** для `your-domain.com` → `YOUR_VPS_IP`
- Создайте **A-запись** для `www.your-domain.com` → `YOUR_VPS_IP`

Проверьте DNS:
```bash
dig your-domain.com
```

### 2. Клонируйте проект на VPS

**Вариант A: Через Git (рекомендуется)**
```bash
# Создайте директорию для проекта
mkdir -p /var/www
cd /var/www

# Клонируйте репозиторий
git clone YOUR_REPOSITORY_URL usss
cd usss
```

**Вариант B: Загрузка с локального компьютера**
На вашем локальном компьютере:
```bash
# Перейдите в папку проекта
cd /Users/mac/Desktop/frontend/usss

# Загрузите на VPS (замените YOUR_VPS_IP)
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@YOUR_VPS_IP:/var/www/usss/
```

### 3. Настройте переменные окружения
```bash
cd /var/www/usss

# Скопируйте пример файла
cp .env.production.example .env.production

# Отредактируйте файл
nano .env.production
```

Заполните следующие значения:
```env
# Database
POSTGRES_USER=usss_user
POSTGRES_PASSWORD=ваш_сильный_пароль_здесь
POSTGRES_DB=usss

# Backend
JWT_SECRET=случайная_строка_минимум_32_символа
NODE_ENV=production

# Frontend
VITE_API_URL=/api

# Domain
DOMAIN=your-domain.com
```

Для генерации безопасного JWT_SECRET:
```bash
openssl rand -base64 32
```

---

## 🚀 Развертывание приложения

### Автоматическое развертывание (рекомендуется)

```bash
cd /var/www/usss

# Запустите скрипт развертывания
./deploy.sh setup
```

Скрипт автоматически:
1. Проверит требования
2. Настроит окружение
3. Получит SSL-сертификат от Let's Encrypt
4. Соберет и запустит все сервисы

### Ручное развертывание

Если хотите выполнить шаги вручную:

#### 1. Обновите конфигурацию Nginx
```bash
# Замените YOUR_DOMAIN.com на ваш домен
sed -i 's/YOUR_DOMAIN.com/your-actual-domain.com/g' nginx/conf.d/default.conf
```

#### 2. Создайте директории для Certbot
```bash
mkdir -p certbot/conf certbot/www
```

#### 3. Запустите Nginx для получения сертификата
```bash
docker-compose -f docker-compose.prod.yml up -d nginx
```

#### 4. Получите SSL-сертификат
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d your-domain.com \
    -d www.your-domain.com
```

#### 5. Запустите все сервисы
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 6. Проверьте статус
```bash
docker-compose -f docker-compose.prod.yml ps
```

Все сервисы должны быть в статусе "Up".

---

## 🔄 Настройка автоматического обновления

### Вариант 1: Через Git (рекомендуется)

#### На VPS:
```bash
cd /var/www/usss

# Создайте скрипт обновления
cat > update.sh << 'EOF'
#!/bin/bash
cd /var/www/usss
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
EOF

chmod +x update.sh
```

#### На локальном компьютере:
```bash
# После внесения изменений
cd /Users/mac/Desktop/frontend/usss

# Закоммитьте изменения
git add .
git commit -m "Описание изменений"
git push origin main

# Обновите на VPS (через SSH)
ssh root@YOUR_VPS_IP "cd /var/www/usss && ./update.sh"
```

### Вариант 2: Через rsync (без Git)

#### На локальном компьютере создайте скрипт:
```bash
cd /Users/mac/Desktop/frontend/usss

cat > sync-to-vps.sh << 'EOF'
#!/bin/bash

VPS_IP="YOUR_VPS_IP"
VPS_USER="root"
VPS_PATH="/var/www/usss"

echo "📤 Синхронизация файлов с VPS..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude 'dist' \
           --exclude 'certbot' \
           --exclude 'postgres_data' \
           ./ $VPS_USER@$VPS_IP:$VPS_PATH/

echo "🔄 Перезапуск приложения на VPS..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml build && docker-compose -f docker-compose.prod.yml up -d"

echo "✅ Обновление завершено!"
EOF

chmod +x sync-to-vps.sh
```

#### Использование:
```bash
# После изменений в коде
./sync-to-vps.sh
```

### Вариант 3: Автоматический деплой через GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/usss
            git pull origin main
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎮 Управление приложением

### Использование скрипта deploy.sh

```bash
cd /var/www/usss

# Интерактивное меню
./deploy.sh

# Или напрямую команды:
./deploy.sh deploy    # Развернуть/передеплоить
./deploy.sh update    # Обновить (pull + rebuild)
./deploy.sh ssl       # Обновить SSL
./deploy.sh logs      # Просмотр логов
./deploy.sh stop      # Остановить сервисы
```

### Команды Docker Compose

```bash
# Просмотр статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f server
docker-compose -f docker-compose.prod.yml logs -f client

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart server

# Остановка всех сервисов
docker-compose -f docker-compose.prod.yml down

# Остановка с удалением volumes (ВНИМАНИЕ: удалит БД!)
docker-compose -f docker-compose.prod.yml down -v

# Пересборка и запуск
docker-compose -f docker-compose.prod.yml up -d --build
```

### Работа с базой данных

```bash
# Подключение к PostgreSQL
docker exec -it usss-postgres psql -U usss_user -d usss

# Бэкап базы данных
docker exec usss-postgres pg_dump -U usss_user usss > backup_$(date +%Y%m%d).sql

# Восстановление из бэкапа
docker exec -i usss-postgres psql -U usss_user usss < backup_20260207.sql
```

---

## 🔍 Решение проблем

### Проверка здоровья сервисов

```bash
# Проверка всех контейнеров
docker ps -a

# Проверка логов
docker-compose -f docker-compose.prod.yml logs --tail=100

# Проверка использования ресурсов
docker stats
```

### Проблема: SSL сертификат не получен

```bash
# Проверьте, что домен указывает на VPS
dig your-domain.com

# Проверьте логи Certbot
docker-compose -f docker-compose.prod.yml logs certbot

# Попробуйте получить сертификат вручную
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --staging \
    -d your-domain.com
```

### Проблема: База данных не подключается

```bash
# Проверьте статус PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Проверьте переменные окружения
cat .env.production

# Пересоздайте контейнер БД
docker-compose -f docker-compose.prod.yml up -d --force-recreate postgres
```

### Проблема: Приложение не отвечает

```bash
# Проверьте Nginx
docker-compose -f docker-compose.prod.yml logs nginx

# Проверьте backend
docker-compose -f docker-compose.prod.yml logs server

# Проверьте frontend
docker-compose -f docker-compose.prod.yml logs client

# Перезапустите все сервисы
docker-compose -f docker-compose.prod.yml restart
```

### Очистка Docker (освобождение места)

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## 📊 Мониторинг

### Просмотр логов в реальном времени

```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Только backend
docker-compose -f docker-compose.prod.yml logs -f server

# Только Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Проверка использования ресурсов

```bash
# Использование CPU/RAM контейнерами
docker stats

# Использование диска
df -h
du -sh /var/lib/docker
```

---

## 🔐 Безопасность

### Рекомендации:

1. **Смените пароли по умолчанию** в `.env.production`
2. **Настройте файрвол** (UFW уже настроен выше)
3. **Отключите root-доступ по SSH**:
   ```bash
   # Создайте нового пользователя
   adduser deploy
   usermod -aG sudo deploy
   usermod -aG docker deploy
   
   # Отредактируйте SSH конфиг
   nano /etc/ssh/sshd_config
   # Установите: PermitRootLogin no
   
   systemctl restart sshd
   ```

4. **Настройте автоматические обновления**:
   ```bash
   apt install unattended-upgrades -y
   dpkg-reconfigure --priority=low unattended-upgrades
   ```

5. **Регулярно делайте бэкапы базы данных**

---

## 📞 Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## ✅ Чеклист развертывания

- [ ] VPS подготовлен (Docker, Docker Compose установлены)
- [ ] Домен настроен (A-записи созданы)
- [ ] Проект загружен на VPS
- [ ] `.env.production` настроен
- [ ] SSL-сертификат получен
- [ ] Все сервисы запущены
- [ ] Приложение доступно по HTTPS
- [ ] Настроен процесс обновления
- [ ] Настроены бэкапы базы данных
- [ ] Проверена безопасность

---

**Готово! Ваше приложение развернуто и готово к использованию! 🎉**
