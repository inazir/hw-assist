/*PLEASE READ
- This script works in combination with the google form (বাড়ির কাজ । স্কুল-০x । কচিকাঁচার বর্ণমালা)
- To open this script, Click on the three dot of the google form-> Script editor
- There has to be parent folder in drive upon which the subfolders will be created. In this script the parent folder ID is saved under constant PARENT_FOLDER_ID
- If used for the for the first time (of after any change), the 'initialize' function has to be run once, which will create a new trigger.
- This 'initialize' run will ask for permission to the corresponding parent folder folder, which has to be granted.
- Then 'OnFormSubmit' function has to be run once too, so that from the next form submission onward, the script can work accordingly.
- Current tirggers and execution logs are helpful for debugging.
*/

//This function returns the child-folder or sub-folder with a given name under a parent-folder
function getSubFolder(childFolderName, parentFolderName) {
  var parentFolder, parentFolders;
  var childFolder, childFolders;
  // Gets FolderIterator for parentFolder
  parentFolders = DriveApp.getFoldersByName(parentFolderName);
  /* Checks if FolderIterator has Folders with given name
  Assuming there's only a parentFolder with given name... */ 
  while (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  }
  // If parentFolder is not defined it sets it to root folder
  if (!parentFolder) { parentFolder = DriveApp.getRootFolder(); }
  // Gets FolderIterator for childFolder
  childFolders = parentFolder.getFoldersByName(childFolderName);
  /* Checks if FolderIterator has Folders with given name
  Assuming there's only a childFolder with given name... */ 
  while (childFolders.hasNext()) {
    childFolder = childFolders.next();
  }
  return childFolder;
}

//This function deletes all the folders with a given name.
function deleteFolder(folderName) {
  var folderToDelete = DriveApp.getFoldersByName(folderName).next();
  var returnedFolder = folderToDelete.setTrashed(true);
  Logger.log('returnedFolder is trashed: ' + returnedFolder.isTrashed());
};


// This funktion makes sure there's only single subfolder is created under a parent folder. The other subfolders with the same name (if exist) are deleted.
function getSingleSubFolder(parentFolder, subfolderName) {
  var parent_folder_name = parentFolder.getName();
  Logger.log(parent_folder_name);
  var subFolder = getSubFolder(subfolderName, parent_folder_name);
  Logger.log("Subfolder is - " + subFolder);
  if (subFolder === undefined) {
    Logger.log("Folder is undefined, hence doesn't exist. Creating..")
    parentFolder.createFolder(subfolderName);
    Logger.log("Subfolder is - " + subFolder);
  };
  if (subFolder){
    Logger.log('Folder exists! Deleting and creating again.. ');
    deleteFolder(subFolder);
    Logger.log('Creating again - ' + subFolder);
    parentFolder.createFolder(subfolderName);
    Utilities.sleep(2000)
  }
  var subFolder = getSubFolder(subfolderName, parent_folder_name);
  return subFolder;
}

// This script creates sub-folder under the parent folder with id 'PARENT_FOLDER_ID' for each submission and
// makes sure the files (homeworks) are uploaded to the corresponding sub-folder.
const PARENT_FOLDER_ID = '1iIZz5DvyKUIuRX9lJ0dAwXHjlkCwhpfu';  // Folder location-> Kochikachar Bornomala/
                                              //কচিকাচার বর্ণমালা-লেখাপড়া/স্কুল_০2/০৩_বাড়ির কাজ জমা নেয়া/Homework-main-folder

const initialize = () => {
  const form = FormApp.getActiveForm();
  Utilities.sleep(1000)
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
};

const onFormSubmit = ({ response } = {}) => {
      Utilities.sleep(1000)
  try {
    // Get a list of all files uploaded with the response
    Utilities.sleep(500)
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
      var subfolderName = studentName + '_' + 'homework';
      Logger.log("sub-folder name based on form response is - " + subfolderName);
      var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      subfolder = getSingleSubFolder(parentFolder, subfolderName); // if subfolder exists, deleted and the created again
      // var subfolder = parentFolder.createFolder(subfolderName);
      Utilities.sleep(1000)
      files.forEach((fileId) => {
        // Move each file into the custom folder
        Utilities.sleep(500)
        Logger.log("File with the id '" + fileId + "' is being moved to the subfolder - " + subfolder);
        DriveApp.getFileById(fileId).moveTo(subfolder); // TOOD: this move is showing exception: https://stackoverflow.com/questions/63275685/how-to-move-a-folder-in-google-drive-using-google-apps-script
      });
    }
  } catch (f) {
    Logger.log(f);
  }
};