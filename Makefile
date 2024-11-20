up:
	docker-compose up --build

# Comando para detener y eliminar todos los contenedores e imágenes
clean:
	docker-compose down --rmi all

re:
	docker-compose down --rmi all
	docker-compose up --build