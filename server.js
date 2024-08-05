
const { log } = require('react-modal/lib/helpers/ariaAppHider');
const {Telegraf, Markup,session} = require('telegraf')
require('dotenv').config({})
// const User = require('./model')
// const mongoose = require('mongoose')
const { message } = require('telegraf/filters')
const ariaAppHider = require('react-modal/lib/helpers/ariaAppHider');

const bot  = new Telegraf(process.env.TELEGRAM_BOT_API);

// bot.start(async(ctx) => {

//     const userInfo = ctx.update.message.from ;
//     try{
//          await User.findOneAndUpdate({teleId : userInfo.id},{
//             teleId : userInfo.id,
//             isBot : userInfo.is_bot,
//             firstname : userInfo.first_name,
//             lastname : userInfo.last_name
//          },{upsert : true, new : true})

//          await ctx.reply(`Welcome ${userInfo.first_name} to the brand new EMO platform ~ Abhishek, founder`)
//     }catch(err)
//     {
//         await ctx.reply("Error in updating data❌")
//         console.error("Error :",err)
//     }

//     console.log("context",ctx.update.message.from);
// })

// Track of user states
const userStates = {}; 

bot.use(session());

bot.start(async(ctx) => {

    const userInfo = ctx.update.message.from ;
    if(!ctx.session || ctx.session.login == false)
        {
           ctx.session = {} ;
           ctx.session.login = false ;
           ctx.session.delId = "" ;
           ctx.session.userId = "" ;
           ctx.session.jobs = {}
           
            ctx.reply(`Hi ${userInfo.first_name}, welcome to EMO ~Abhishek, admin`)
            ctx.reply('Please enter your phone number:');
            userStates[ctx.chat.id] = { state: 'awaiting_username' };
        }
        else
        {
            ctx.reply(`Welcome back ${userInfo.first_name} how can I assist you ?`) ;
        }
 
  


  console.log("User details : ",ctx);
  
 console.log("session", ctx.session);
 

//  ctx.session.login = false

// console.log(userStates);

  
});


bot.command('/logout',async(ctx)=>{
 delete userStates[ctx.chat.id]
 await ctx.reply("You have successfully logged out, see u again...")
 ctx.session.login=false


})

bot.command('menu',  (ctx) => {

    if(ctx.session != undefined && ctx.session.login == true)
    {
        ctx.reply('Choose an option:', Markup.inlineKeyboard([
            Markup.button.callback('Find Jobs', 'find_jobs'),
            Markup.button.callback('Create Job', 'create_job'),
            Markup.button.callback('Query Admin', 'query_admin'),
            Markup.button.callback('Find Workers', 'find_workers')
          ]));
    }
    else
    ctx.reply("You need to login first...")
   
  });
  
  // Callback handlers for the buttons
  bot.action('find_jobs', async(ctx) => {
    ctx.answerCbQuery(); // Acknowledge the button click
     
    // ctx.userStates[ctx.chat.id].state = "await_job_sequence"
    ctx.reply("Enter the job sequence to apply..")
    try{
        const response = await fetch(`https://online-job-portal-part-time.onrender.com/api/jobs/getalljobs`, {
            method : 'GET'
            
           })

           if(response.ok)
           {
            const workersData = await response.json() ;
            // console.log(workersData.msg);

            if(workersData.msg.length > 0)
            {
               userStates[ctx.chat.id].state = "awaiting_job_sequence"
               workersData.msg.map((worker,index)=>{
                 const content = ["Job sequence : " + index,"Employer name : " + worker.employer.username, "Phone number : "+ worker.employer.phone,
                  "Category : "+worker.category, "Description : "+ worker.description, "Address : "+ worker.locationAdd
                 ] ;

                 const newLineContent = content.join('\n') ;
                 ctx.reply(newLineContent)
                 ctx.session.jobs = workersData.msg
               })
            }
            else
            ctx.reply("There are no available jobs...")
            

            
           }
           else
           {
            ctx.reply("Zuck")
           }
    }catch(err)
    {
        ctx.reply("Some error occurred in fetching data")
        console.log(err, "===========>");
        
    }
  });
  
  bot.action('create_job', (ctx) => {
    ctx.answerCbQuery(); 
    const chatId = ctx.chat.id ;
    const userState = userStates[chatId] || {} ;
    userState.state = "awaiting_job_details"
    userStates[chatId].state = "awaiting_job_details" ;
    ctx.reply('Please provide the job details to create new job');
    ctx.reply("category?")

    


  


  });

  bot.action('find_workers', async(ctx) => {
    ctx.answerCbQuery(); // Acknowledge the button click
     
    ctx.reply("showing results")
    try{
        const response = await fetch(`https://online-job-portal-part-time.onrender.com/api/auth/profile`, {
            method : 'GET'
            
           })

           if(response.ok)
           {
            const workersData = await response.json() ;
            console.log(workersData.msg);

            if(workersData.msg.length > 0)
            {
               workersData.msg.map((worker)=>{
                 const content = ["Username : " + worker.username, "Email : "+ worker.email,
                  "Phone number : "+worker.phone, "Skills : "+ worker.skills, "Address : "+ worker.locationAdd
                 ] ;

                 const newLineContent = content.join('\n') ;
                 ctx.reply(newLineContent)
               })
            }
            // ctx.reply(JSON.stringify(workersData.msg))
            
           }
           else
           {
            ctx.reply("Zuck")
           }
    }catch(err)
    {
        ctx.reply("Some error occurred in fetching data")
        console.log(err, "===========>");
        
    }
  });
  
  bot.action('query_admin', (ctx) => {
    ctx.answerCbQuery(); // Acknowledge the button click
    ctx.reply('Please enter your query...');
  });

bot.on('text', async(ctx) => {
  const chatId = ctx.chat.id;
  const userState = userStates[chatId] || {};

 console.log(ctx.message.text);
 
  let getMessage= ctx.message.text

  

  if (userState.state === 'awaiting_username') {
    userState.username = ctx.message.text;
    userState.state = 'awaiting_password';
    ctx.reply('Please enter your password:');
  } 
  else if (userState.state === 'awaiting_password') {
    userState.password = ctx.message.text;
    userState.state = 'complete';

    const loginDetails = {
        phone : userState.username,
        password : userState.password
    }

     ctx.session.delId = (await ctx.reply("Connecting to server 🌐, please wait...")) ;
    try{
        const response = await fetch(`http://online-job-portal-part-time.onrender.com/api/auth/login`, {
            method : 'POST',
            headers : {
              "Content-Type" : "application/json"
            },
            body : JSON.stringify(loginDetails)
           })

           if(response.ok)
           {
             const logindata = await response.json() ;
             ctx.session.login = true
             ctx.session.userId = logindata.userId ;
             ctx.reply(`Thank you, ${logindata.username}. You have successfully logged in.`)
           }
           else
           {
            ctx.reply("invalid credentials...")
           }

           ctx.deleteMessage(ctx.session.delId.message_id) ;
           ctx.session.delId = "";
    }catch(err)
    {
        ctx.reply("some error occurred : " + err)
    }
   
    
    // Clear the user state after processing
    // delete userStates[chatId];
  }
  
  else if(userState.state == "awaiting_job_sequence")
  {
     userState.state="awaiting_job_budget" ;
     userState.jobseq = parseInt(getMessage)
     ctx.reply("Enter your expected budget")

  }
  else if(userState.state == "awaiting_job_budget")
  {
    userState.state = "awaiting_job_message" ;
    userState.jobBudget = getMessage
    ctx.reply("Enter your message to recruiter:")
    console.log(ctx.session);
    
  }
  else if(userState.state == "awaiting_job_message")
  {
      userState.jobMessage = getMessage
    
     userState.state = "done"
     try{
        
     
        const apply = await fetch('https://online-job-portal-part-time.onrender.com/api/jobs/jobapply',{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body : JSON.stringify({userId : ctx.session.userId, 
            jobId : ctx.session.jobs[userState.jobseq],demandedBudget: userState.jobBudget,description: userState.jobMessage})
        })

        if(apply!= undefined)
        {
           ctx.reply("Job Applied successfully!!!");
        }
        else
        {
          const mesg = await apply.json()
          console.log("errrrror",mesg.msg);
          
          // console.log(apply);
          
          ctx.reply("could not apply")
        }
     }catch(err)
     {
      console.log(err)
       ctx.reply("Unable to apply to job: " + err)
     }
  }

  else if(userState.state == "awaiting_job_details")
  {
     userState.state = "awaiting_description"
     userState.category = getMessage
     ctx.reply("Job description ?")
  }
  else if(userState.state == "awaiting_description")
    {
       userState.state = "awaiting_duration"
       userState.description = getMessage
       ctx.reply("Duration ?")
    }
    else if(userState.state == "awaiting_duration")
      {
         userState.state = "awaiting_budget"
         userState.duration = getMessage
         ctx.reply("Expected budget ?")
      }
      else if(userState.state == "awaiting_budget")
        {
           userState.state = "awaiting_location"
           userState.budget = getMessage
            ctx.reply("Location for job ?")
        }
        else if(userState.state == "awaiting_location")
          {
             userState.state = "done"
             userState.location = getMessage

             try{
     
              const response = await fetch(`https://online-job-portal-part-time.onrender.com/api/jobs/createjob`, {
                method : 'POST',
                headers : {
                  "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                  category:userState.category,
                  description : userState.description,
                  startDate : Date.now(),
                  locationAdd : userState.location,
                  employer : ctx.session.userId,
                  budget : userState.budget
                })
               })
        
              
        
              if(response.ok)
              {
                // const jsonData = await response.json()
                // console.log("Job details" , jsonData.msg);
                ctx.reply("Job created successfully")

        
                
              }
              else
              {
                const jsonData = await response.json()
                ctx.reply(jsonData)
              }
        
             } catch(err){
               console.log("Error:", err);
               ctx.reply("Unable to create job")
             }
            
          }
      
});


bot.command('generate',async(ctx)=> ctx.reply("💖"))

module.exports = bot;


// Launch the bot
bot.launch().catch(error => {
  console.error('Failed to launch bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Received SIGINT, stopping bot...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('Received SIGTERM, stopping bot...');
  bot.stop('SIGTERM');
});