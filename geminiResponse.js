const { GoogleGenerativeAI } = require("@google/generative-ai");


const geminiResponse =async(prompt)=>{
    try {
        
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

      
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text
        

    
      } 
    catch(err)
    {
        return ("Some error occurred : " + err)
    }
}

module.exports = geminiResponse