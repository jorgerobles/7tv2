.PHONY: start
start:
	docker run -it -p "3000:3000" -v ./:/app 7tv2-app yarn run start

.PHONY: sh
sh:
	docker run -it -p "3000:3000" -v ./:/app 7tv2-app /bin/sh