FROM kong:3.4
USER root
COPY kong.yml /usr/local/kong/declarative/
USER kong
ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml
