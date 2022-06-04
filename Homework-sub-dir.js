/*PLEASE READ
- This script works in combination with the google form (বাড়ির কাজ । স্কুল-০x । কচিকাঁচার বর্ণমালা)
- To open this script, Click on the three dot of the google form-> Script editor
- There has to be parent folder in drive upon which the subfolders will be created. In this script the parent folder ID is saved under constant PARENT_FOLDER_ID
- If used for the for the first time (of after any change), the 'initialize' function has to be run once, which will create a new trigger.
- This 'initialize' run will ask for permission to the corresponding parent folder folder, which has to be granted.
- Then 'OnFormSubmit' function has to be run once too, so that from the next form submission onward, the script can work accordingly.
- Current tirggers and execution logs are helpful for debugging.
*/


//This function deletes a folder with ID.
function deleteFolderById(folderId) {
  var folderToDelete = DriveApp.getFolderById(folderId);
  var returnedFolder = folderToDelete.setTrashed(true);
  Logger.log('returnedFolder is trashed: ' + returnedFolder.isTrashed());
  if (returnedFolder.isTrashed()){
    Logger.log("Success! Folder with the name '" + folderToDelete.getName() + "' is deleted.");
  }
  else{
    Logger.log("Error! Folder with the name '" + folderToDelete.getName() + "' couldn't be deleted.");
  }
}

// This funktion deletes the subfolder(s) with name under a parent folder.
function deleteExistingSubFoldersWithName(parentFolderId, subfolderName) {
  var subFolders =  DriveApp.getFolderById(parentFolderId).getFolders();
  while (subFolders.hasNext()) {
    subFolder = subFolders.next();
    if (subFolder.getName() == subfolderName){
      Logger.log('Subfolder exists! Deleting the subfolder with the name: ' + subFolder.getName());
      deleteFolderById(subFolder.getId());
    }
  }
}

// This script creates sub-folder under the parent folder with id 'PARENT_FOLDER_ID' for each submission and
// makes sure the files (homeworks) are uploaded to the corresponding sub-folder.
const PARENT_FOLDER_ID = 'paste_parent_folder_ID_here';  // Folder location-> Kochikachar Bornomala/
                                              //কচিকাচার বর্ণমালা-লেখাপড়া/স্কুল_০x/০৩_বাড়ির কাজ - জমা নেয়া

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
      var formResponses = form1.getResponses();
      var latestResponse = formResponses[form1.getResponses().length-1];
      const itemResponses = latestResponse.getItemResponses();
      var studentName = itemResponses[0].getResponse();          
      var subfolderName = studentName + '_Homework';
      Logger.log("sub-folder name based on form response is - " + subfolderName);
      var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      deleteExistingSubFoldersWithName(PARENT_FOLDER_ID, subfolderName); // Existing subfolder(s) with the name is (are) deleted.
      Logger.log("Subfolder is being created with the name: " + subfolderName);
      var subfolder = parentFolder.createFolder(subfolderName);
      Logger.log("Subfolder is created with the name: " + subfolder.getName());
      Utilities.sleep(1000)
      files.forEach((fileId) => {
        // Move each file into the custom folder
        Logger.log("File with the id '" + fileId + "' is being moved to the subfolder - " + subfolder);
        DriveApp.getFileById(fileId).moveTo(subfolder); // TOOD: this move is showing exception: https://stackoverflow.com/questions/63275685/how-to-move-a-folder-in-google-drive-using-google-apps-script
      });
    }
  } catch (f) {
    Logger.log(f);
  }
};