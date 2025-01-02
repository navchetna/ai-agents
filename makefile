.PHONY: ui

# starts ui server
ui:
	cd ui; npm run dev;	

## installs dependencies
build-ui:
	cd ui; npm i; cd ..;