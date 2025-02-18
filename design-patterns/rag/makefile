.PHONY: ui

# starts ui server
ui:
	cd ui; npm run dev;	

## installs dependencies
setup-ui:
	cd ui; npm i; cd ..;

## build ui
build-ui:
	cd ui; NEXT_PUBLIC_SERVER_URL=${SERVER_URL} npm run build; cd ..;