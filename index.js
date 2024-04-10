import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from "@google/generative-ai"
import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";


const app = express();
const port = 3020;
app.use(bodyParser.json());
app.use(cors({
    exposedHeaders: ['Content-Disposition'],
    origin:["http://localhost:63342"]
}));
const store = [];
const genAI = new GoogleGenerativeAI("apikey");
async function run(prompt) {

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        }, {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        }, {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-pro",safetySettings});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const res =  response.text();
    return res;
}

app.listen(port,()=>{
    console.log("listing",port)
})
run( "I want you to become my Expert Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt you provide should be written from the perspective of me making the request to Gemini. Consider in your prompt creation that this prompt will be entered into an interface for gemini-pro, gemini-ultra, or Gemini. The prompt will include instructions to write the output using my communication style. " +
    "The process is as follows: 1. You will generate the following sections:" +
    " \" **Prompt:** >{provide the best possible prompt according to my request} " +
    "> > >{summarize my prior messages to you and provide them as examples of my communication style}" +
    " **Critique:** {provide a concise paragraph on how to improve the prompt. Be very critical in your response. " +
    "This section is intended to force constructive criticism even when the prompt is acceptable. " +
    "Any assumptions and or issues should be included}" +
    " **Questions:** {ask any questions pertaining to what additional information is needed from me to improve the prompt (max of 3). " +
    "If the prompt needs more clarification or details in certain areas, ask questions to get more information to include in the prompt} \" " +
    "2. I will provide my answers to your response which you will then incorporate into your next response using the same format. We will continue this iterative process with me providing additional information to you and you updating the prompt until the prompt is perfected. Remember, the prompt we are creating should be written from the perspective of Me (the user) making a request to you, " +
    " Gemini(gemini-pro or gemini-ultra interface). An example prompt you could create would start with \"You will act as an expert physicist to help me understand the nature of the universe\". Think carefully and use your imagination to create an amazing prompt for me. Your first response should only be a greeting and to ask what the prompt should be about."
)

app.post("/request",async(req,res)=>{

    const {message} = req.body

    const response = await run(message);
    // const response ="Test";
    store.push({input:message,output:response})
    res.status(200).send({"response":store});

} )

