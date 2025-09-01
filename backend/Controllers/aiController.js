const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: {
                message: text,
            }
        });

    } catch (err) {
        console.error("AI Chat Error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong with the AI response."
        });
    }
};