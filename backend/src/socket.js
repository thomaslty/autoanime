const { Server } = require('socket.io');
const { logger } = require('./utils/logger');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Socket.IO client connected');

    // Send current service status immediately on connect
    try {
      const { getStatus } = require('./services/connectionMonitor');
      socket.emit('services:status', getStatus());
    } catch (err) {
      logger.debug({ error: err.message }, 'Could not send initial service status');
    }

    // Client joins a room scoped to a series ID
    socket.on('watch:series', (seriesId) => {
      socket.join(`series:${seriesId}`);
      logger.debug({ socketId: socket.id, seriesId }, 'Client watching series');
    });

    socket.on('unwatch:series', (seriesId) => {
      socket.leave(`series:${seriesId}`);
      logger.debug({ socketId: socket.id, seriesId }, 'Client unwatched series');
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Socket.IO client disconnected');
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
