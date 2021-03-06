// This script creates sub-folder under the parent folder with id 'PARENT_FOLDER_ID' for each submission and
// makes sure the files (homeworks) are uploaded to the corresponding sub-folder.
const PARENT_FOLDER_ID = '1iIZz5DvyKUIuRX9lJ0dAwXHjlkCwhpfu';  // Folder location-> Kochikachar Bornomala/
                                              //কচিকাচার বর্ণমালা-লেখাপড়া/স্কুল_০2/০৩_বাড়ির কাজ জমা নেয়া/Homework-main-folder

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
      var formattedDate = Utilities.formatDate(response.getTimestamp(), "GMT", "dd-MM-yyyy_HH:mm:ss");
      const subfolderName = studentName + '_' + formattedDate;
      // const subfolderName = studentName;
      const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      const subfolder = parentFolder.createFolder(subfolderName);
      files.forEach((fileId) => {
        // Move each file into the custom folder
        DriveApp.getFileById(fileId).moveTo(subfolder);
      });
    }
  } catch (f) {
    Logger.log(f);
  }
};