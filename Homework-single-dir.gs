// This script creates sub-folder under the parent folder with id 'PARENT_FOLDER_ID' for each submission and
// makes sure the files (homeworks) are uploaded to the corresponding sub-folder.
const PARENT_FOLDER_ID = '';  // Folder location-> Kochikachar Bornomala/
                                              //কচিকাচার বর্ণমালা-লেখাপড়া/স্কুল_০3/০৩_বাড়ির কাজ জমা নেয়া/পুরানো বাড়ির কাজ /test-upload

const initialize = () => {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
};

const onFormSubmit = ({ response } = {}) => {

  try {
    // Get a list of all files uploaded with the response
    const files = response.getItemResponses()
      // We are only interested in File Upload type of questions
      .filter((itemResponse) => itemResponse.getItem().getType().toString() === 'FILE_UPLOAD')
      .map((itemResponse) => itemResponse.getResponse())
      // The response includes the file ids in an array that we can flatten
      .reduce((a, b) => [...a, ...b], []);

    if (files.length > 0) {   
      var form1 = FormApp.getActiveForm();     
      formResponses = form1.getResponses(),
      latestResponse = formResponses[form1.getResponses().length-1];
      const itemResponses = latestResponse.getItemResponses(),
      studentName = itemResponses[0].getResponse();          
      // Each form response has a unique Timestamp
	  // subfolder not needed for single folder upload, hence commenting out.
      // const subfolderName = studentName + '-' + response.getTimestamp();
      //const subfolder = parentFolder.createFolder(subfolderName);
	  const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      files.forEach((fileId) => {
        // Move each file into the custom folder
        DriveApp.getFileById(fileId).moveTo(parentFolder);
      });
    }
  } catch (f) {
    Logger.log(f);
  }
};