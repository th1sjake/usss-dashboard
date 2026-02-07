# ✅ Чеклист развертывания USSS на VPS

## 📝 Подготовка (на вашем компьютере)

- [ ] Убедитесь, что все файлы созданы:
  - [ ] `docker-compose.prod.yml`
  - [ ] `server/Dockerfile.prod`
  - [ ] `client/Dockerfile.prod`
  - [ ] `client/nginx.conf`
  - [ ] `nginx/nginx.conf`
  - [ ] `nginx/conf.d/default.conf`
  - [ ] `.env.production.example`
  - [ ] `deploy.sh` (исполняемый)
  - [ ] `.gitignore`

- [ ] Инициализируйте Git репозиторий (если еще не сделано):
  ```bash
  cd /Users/mac/Desktop/frontend/usss
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [ ] Создайте репозиторий на GitHub/GitLab (опционально, но рекомендуется):
  ```bash
  # Добавьте remote
  git remote add origin YOUR_REPO_URL
  git push -u origin main
  ```

## 🖥️ Настройка VPS

### 1. Подключение и базовая настройка

- [ ] Подключитесь к VPS:
  ```bash
  ssh root@YOUR_VPS_IP
  ```

- [ ] Обновите систему:
  ```bash
  apt update && apt upgrade -y
  ```

- [ ] Установите Docker:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  systemctl enable docker
  systemctl start docker
  docker --version
  ```

- [ ] Установите Docker Compose:
  ```bash
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  docker-compose --version
  ```

- [ ] Установите Git:
  ```bash
  apt install git -y
  ```

- [ ] Настройте файрвол:
  ```bash
  apt install ufw -y
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ufw status
  ```

### 2. Настройка домена

- [ ] Зайдите в панель управления вашего регистратора доменов
- [ ] Создайте A-запись: `your-domain.com` → `YOUR_VPS_IP`
- [ ] Создайте A-запись: `www.your-domain.com` → `YOUR_VPS_IP`
- [ ] Подождите 5-15 минут для распространения DNS
- [ ] Проверьте DNS:
  ```bash
  dig your-domain.com
  # или
  nslookup your-domain.com
  ```

### 3. Загрузка проекта на VPS

**Вариант A: Через Git (рекомендуется)**

- [ ] Клонируйте репозиторий:
  ```bash
  mkdir -p /var/www
  cd /var/www
  git clone YOUR_REPO_URL usss
  cd usss
  ```

**Вариант B: Прямая загрузка с компьютера**

- [ ] На вашем компьютере выполните:
  ```bash
  cd /Users/mac/Desktop/frontend/usss
  rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ root@YOUR_VPS_IP:/var/www/usss/
  ```

### 4. Настройка окружения

- [ ] Создайте файл `.env.production`:
  ```bash
  cd /var/www/usss
  cp .env.production.example .env.production
  nano .env.production
  ```

- [ ] Заполните переменные окружения:
  ```env
  POSTGRES_USER=usss_user
  POSTGRES_PASSWORD=ваш_сильный_пароль
  POSTGRES_DB=usss
  JWT_SECRET=случайная_строка_32_символа
  NODE_ENV=production
  VITE_API_URL=/api
  DOMAIN=your-domain.com
  ```

- [ ] Сгенерируйте безопасный JWT_SECRET:
  ```bash
  openssl rand -base64 32
  ```

- [ ] Сохраните файл (Ctrl+O, Enter, Ctrl+X в nano)

### 5. Развертывание

**Автоматическое (рекомендуется):**

- [ ] Запустите скрипт развертывания:
  ```bash
  cd /var/www/usss
  chmod +x deploy.sh
  ./deploy.sh setup
  ```

- [ ] Следуйте инструкциям скрипта:
  - Введите ваш домен
  - Введите email для Let's Encrypt
  - Дождитесь завершения

**Ручное:**

- [ ] Обновите Nginx конфигурацию:
  ```bash
  sed -i 's/YOUR_DOMAIN.com/your-actual-domain.com/g' nginx/conf.d/default.conf
  ```

- [ ] Создайте директории для сертификатов:
  ```bash
  mkdir -p certbot/conf certbot/www
  ```

- [ ] Запустите Nginx:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d nginx
  ```

- [ ] Получите SSL сертификат:
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

- [ ] Запустите все сервисы:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

### 6. Проверка

- [ ] Проверьте статус контейнеров:
  ```bash
  docker-compose -f docker-compose.prod.yml ps
  ```
  Все должны быть в статусе "Up"

- [ ] Проверьте логи:
  ```bash
  docker-compose -f docker-compose.prod.yml logs -f
  ```

- [ ] Откройте браузер и перейдите на `https://your-domain.com`
- [ ] Убедитесь, что:
  - [ ] Сайт открывается по HTTPS
  - [ ] SSL сертификат валиден (замок в адресной строке)
  - [ ] Страница входа отображается корректно
  - [ ] Можно войти в систему

## 🔄 Настройка автоматического обновления

### Вариант 1: Через Git

**На VPS:**

- [ ] Создайте скрипт обновления:
  ```bash
  cd /var/www/usss
  cat > update.sh << 'EOF'
  #!/bin/bash
  cd /var/www/usss
  git pull origin main
  docker-compose -f docker-compose.prod.yml build
  docker-compose -f docker-compose.prod.yml up -d
  EOF
  
  chmod +x update.sh
  ```

**На вашем компьютере:**

- [ ] Создайте скрипт для быстрого деплоя:
  ```bash
  cd /Users/mac/Desktop/frontend/usss
  cat > quick-deploy.sh << 'EOF'
  #!/bin/bash
  git add .
  git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"
  git push origin main
  ssh root@YOUR_VPS_IP "cd /var/www/usss && ./update.sh"
  EOF
  
  chmod +x quick-deploy.sh
  ```

- [ ] Теперь для обновления просто запускайте:
  ```bash
  ./quick-deploy.sh
  ```

### Вариант 2: Прямая синхронизация (без Git)

**На вашем компьютере:**

- [ ] Создайте скрипт синхронизации:
  ```bash
  cd /Users/mac/Desktop/frontend/usss
  cat > sync-to-vps.sh << 'EOF'
  #!/bin/bash
  
  VPS_IP="YOUR_VPS_IP"
  VPS_USER="root"
  VPS_PATH="/var/www/usss"
  
  echo "📤 Синхронизация файлов..."
  rsync -avz --exclude 'node_modules' \
             --exclude '.git' \
             --exclude 'dist' \
             --exclude 'certbot' \
             --exclude 'postgres_data' \
             ./ $VPS_USER@$VPS_IP:$VPS_PATH/
  
  echo "🔄 Перезапуск на VPS..."
  ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml up -d --build"
  
  echo "✅ Готово!"
  EOF
  
  chmod +x sync-to-vps.sh
  ```

- [ ] Замените `YOUR_VPS_IP` на реальный IP
- [ ] Для обновления запускайте:
  ```bash
  ./sync-to-vps.sh
  ```

## 🔐 Безопасность (опционально, но рекомендуется)

- [ ] Создайте нового пользователя (не root):
  ```bash
  adduser deploy
  usermod -aG sudo deploy
  usermod -aG docker deploy
  ```

- [ ] Настройте SSH ключи для нового пользователя

- [ ] Отключите root-доступ по SSH:
  ```bash
  nano /etc/ssh/sshd_config
  # Установите: PermitRootLogin no
  systemctl restart sshd
  ```

- [ ] Настройте автоматические обновления:
  ```bash
  apt install unattended-upgrades -y
  dpkg-reconfigure --priority=low unattended-upgrades
  ```

## 📊 Настройка бэкапов

- [ ] Создайте скрипт бэкапа БД:
  ```bash
  cat > /var/www/usss/backup-db.sh << 'EOF'
  #!/bin/bash
  BACKUP_DIR="/var/backups/usss"
  mkdir -p $BACKUP_DIR
  docker exec usss-postgres pg_dump -U usss_user usss > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
  # Удалить бэкапы старше 7 дней
  find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
  EOF
  
  chmod +x /var/www/usss/backup-db.sh
  ```

- [ ] Настройте cron для автоматических бэкапов:
  ```bash
  crontab -e
  # Добавьте строку (бэкап каждый день в 3:00):
  0 3 * * * /var/www/usss/backup-db.sh
  ```

## ✅ Финальная проверка

- [ ] Сайт доступен по HTTPS
- [ ] SSL сертификат валиден
- [ ] Можно войти в систему
- [ ] Все функции работают:
  - [ ] Регистрация/вход
  - [ ] Просмотр статистики
  - [ ] Создание отчетов
  - [ ] Таблица лидеров
  - [ ] Админ-панель (если админ)
  - [ ] Настройки профиля
- [ ] Настроен процесс обновления
- [ ] Настроены бэкапы

## 📞 Полезные команды

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Остановка
docker-compose -f docker-compose.prod.yml down

# Статус
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Бэкап БД
docker exec usss-postgres pg_dump -U usss_user usss > backup.sql
```

---

## 🎉 Поздравляем!

Если все пункты отмечены, ваше приложение успешно развернуто и готово к использованию!

**Адрес**: https://your-domain.com

Для получения дополнительной помощи см.:
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - подробная инструкция
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - быстрые команды
- 📘 [README.md](./README.md) - общая информация о проекте
