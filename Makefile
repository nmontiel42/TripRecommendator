# Makefile para gestionar procesos en el puerto 3000

.PHONY: clean

up:
	node server.js

clean:
	@echo "Buscando procesos en el puerto 3000..."
	@pid=$$(lsof -t -i:3000) && [ -n "$$pid" ] && kill -9 $$pid || echo "No hay procesos en el puerto 3000."

re:
	make clean
	make up