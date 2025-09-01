  const express = require("express");
  const http = require("http");
  const { Server } = require("socket.io");
  const dbConnect = require("./config/database");
  const cloudinaryConnect = require("./config/cloudinary");
  const fileUpload = require("express-fileupload");
  const cors = require("cors");
  const chatRoutes = require("./routes/chats")
  require("dotenv").config();

  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT || 4000;

  // Middleware
  app.use(express.json());
  app.use(cors({
    origin: "http://localhost:3000", // Allow your Next.js frontend
    credentials: true,
  }));
  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));

  // Database & Cloudinary connection
  dbConnect();
  cloudinaryConnect();
  // Routes
  app.use("/api/v1", chatRoutes);

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat room (for one-on-one and group chats)
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat room ${chatId}`);
    });

    // Handle sending a message
    socket.on("sendMessage", (messageData) => {
      // You can also save the message to the DB here before emitting
      io.to(messageData.chatId).emit("receiveMessage", messageData);
    });

    // Handle typing indicator
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", chatId);
    });

    // Handle stop typing indicator
    socket.on("stopTyping", (chatId) => {
      socket.to(chatId).emit("stopTyping", chatId);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });