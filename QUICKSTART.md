# 🚀 Быстрый старт развертывания

## На VPS (первый раз):

```bash
# 1. Установите Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 2. Клонируйте проект
mkdir -p /var/www && cd /var/www
git clone YOUR_REPO_URL usss
cd usss

# 3. Настройте окружение
cp .env.production.example .env.production
nano .env.production  # Заполните ваши данные

# 4. Запустите автоматическое развертывание
./deploy.sh setup
```

## Обновление кода (с локального компьютера):

### Вариант 1: Через Git (рекомендуется)
```bash
# На локальном компьютере
git add .
git commit -m "Описание изменений"
git push origin main

# На VPS
ssh root@YOUR_VPS_IP "cd /var/www/usss && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
```

### Вариант 2: Прямая синхронизация
```bash
# На локальном компьютере создайте скрипт sync-to-vps.sh:
cat > sync-to-vps.sh << 'EOF'
#!/bin/bash
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@YOUR_VPS_IP:/var/www/usss/
ssh root@YOUR_VPS_IP "cd /var/www/usss && docker-compose -f docker-compose.prod.yml up -d --build"
EOF

chmod +x sync-to-vps.sh

# Используйте для обновления:
./sync-to-vps.sh
```

## Полезные команды:

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Остановка
docker-compose -f docker-compose.prod.yml down

# Бэкап БД
docker exec usss-postgres pg_dump -U usss_user usss > backup.sql
```

📖 **Подробная инструкция**: см. файл `DEPLOYMENT.md`
