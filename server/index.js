import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRoutes from "./routes/AuthRoutes.js"
import contactsRoutes from "./routes/ContactRoutes.js"
import setupSocket from "./socket.js"
import messagesRoutes from "./routes/MessageRoutes.js"
import channelRoutes from "./routes/ChannelRoutes.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATA_BASE_URL;

const corsOptions = {
    origin: function(origin, callback) {
        callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use('/api/auth', authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use('/api/messages', messagesRoutes);
app.use("/api/channel", channelRoutes);

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`)
});

setupSocket(server);

mongoose.connect(databaseURL).then(() => console.log('DB Connection Successful')).catch(err => console.log(err.message));