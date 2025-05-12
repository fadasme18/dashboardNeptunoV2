#---fase de construcción (Build Stage) ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build --prod

#---fase de servidor (Server Stage) ---
    FROM nginx:stable-alpine
    COPY --from=builder /app/dist/dashboard-neptuno/browser /usr/share/nginx/html
    # Copia tu configuración personalizada de Nginx
    COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    
    # #---fase de servidor (Server Stage) ---
    # FROM nginx:stable-alpine
    # COPY --from=builder /app/dist/dashboard-neptuno/browser /usr/share/nginx/html
    
    # EXPOSE 80

    # CMD ["nginx", "-g", "daemon off;"]



# #---fase de construcción (Build Stage) ---
# FROM node:20-alpine AS build

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci192.168.1.18

# COPY . .
# RUN npx ng build

# #---fase de servidor (Server Stage) ---
# FROM nginx:stable-alpine
# COPY --from=build /usr/src/app/dist/dashboard-neptuno /usr/share/nginx/html

# EXPOSE 80