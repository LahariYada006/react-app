import express from "express"
import dotenv from "dotenv"
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

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

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