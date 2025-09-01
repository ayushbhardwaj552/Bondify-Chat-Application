const cloudinary = require('cloudinary')


exports.imageUpload = async (req,res) =>{
  try{
     // data fetch 
      const {name,tags,email} = req.body;
      console.log({name,tags,email})

      const  file = req.files.imageFile;
      console.log(file);

      // validation 
      const supportedTypes = ["jpg","jpeg","png"]
      const fileType = file.name.split('.')[1].toLowerCase();
      
      if(!isFileTypeSupported(fileType,supportedTypes)){
           return res.status(400).json({
            success:true,
            message:"File type does not supported"
           })
      }
     
    // ager file type supported hai 
    const response = await uploadFileToCloudinary(file,"codehelp");
    console.log(response);

    // db mai entry save kerni hai 
    const fileData = await File.create({
      name,
      tags,
      email,
      imageUrl:response.secure_url,
    });
  
    res.json({
      success:true,
      imageUrl:response.secure_url,
      message:"Image uploaded sucessfully "
    })

    } 
  catch(err){
   console.log(err)
   res.status(400).json({
    success:false,
    message:"Something went wrong"
   })
  }
}
