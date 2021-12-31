FROM alpine:3.12
LABEL maintainer="anikumar.net"
WORKDIR /app
RUN apk add --update --no-cache --virtual .build-deps git make cmake libstdc++ gcc g++ automake libtool autoconf linux-headers \
    && git clone https://github.com/xmrig/xmrig.git /tmp/xmrig \
    && mkdir -p /tmp/xmrig/build \
    && mkdir -p /app/xmrig \
    && mkdir -p /app/crypto-miner \
    && mkdir -p /app/share

RUN sed -i 's/kDefaultDonateLevel = 1/kDefaultDonateLevel = 0/' /tmp/xmrig/src/donate.h
RUN sed -i 's/kMinimumDonateLevel = 1/kMinimumDonateLevel = 0/' /tmp/xmrig/src/donate.h

RUN cd /tmp/xmrig/scripts && ./build_deps.sh
RUN cmake -S /tmp/xmrig -B /tmp/xmrig/build -DXMRIG_DEPS=/tmp/xmrig/scripts/deps -DBUILD_STATIC=ON
RUN make -j$(nproc) -C /tmp/xmrig/build
RUN mv /tmp/xmrig/build/xmrig /app/xmrig/
RUN apk del .build-deps 
RUN rm -rf /tmp/*

COPY ./public/ /app/crypto-miner/public
COPY ./res/ /app/crypto-miner/res
COPY ./src/ /app/crypto-miner/src
COPY ./index.js /app/crypto-miner
COPY ./package-lock.json /app/crypto-miner
COPY ./package.json /app/crypto-miner

RUN cp /app/crypto-miner/res/default.config.json /app/xmrig/config.json

ENV PORT=8901
ENV MINER_PORT=8902
ENV XMRIG_HOME=/app/xmrig
ENV CRYPTO_MINER_HOME=/app/crypto-miner
ENV SHARE_DIR=/app/share 

WORKDIR /app/crypto-miner
RUN apk add --update nodejs npm
RUN npm install

EXPOSE 8901
CMD [ "npm", "start" ]
