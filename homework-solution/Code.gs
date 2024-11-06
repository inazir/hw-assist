function centerAllImagesInSlide(slideID) {
 Logger.log("centerAllImagesInSlide function is in progress...");
 // Load the presentation
 var presentation = SlidesApp.openById(slideID);

 // Get the width and height of the presentation
 var pageWidth = presentation.getPageWidth();
 var pageHeight = presentation.getPageHeight();
  // Load the slides in the presentation
 var slides = presentation.getSlides();

 // For each slide, center the images found on the slide
 // Note: if a slide contains more than a single image, they will
 // overlap when you center them.
 slides.forEach(function(slide) {
   var images = slide.getImages();
   images.forEach(function(image) {
     image.setLeft(pageWidth/2 -image.getWidth()/2);
     image.setTop(pageHeight/2 - image.getHeight()/2);
   });
 });
}

function getRandomValues() {
  var values = []
  for (var i = 0; i < 100; ++i) {
    values.push([Math.floor((Math.random()*100)+1)]);
  }
  return values;
}

function collectStudentsFileAndReturnMailBody(folder, slide_Deck) {
  Logger.log("collectStudentsFileAndReturnMailBody function is in progress on the folder: " + folder.getName());
  var mail_body = '';
  var filesIter = folder.getFiles();

  // Check if there are any files in the folder
  if (!filesIter.hasNext()) {
    Logger.log("No files found in the folder: " + folder.getName() + "\n");
    // Continue to the next folder without exiting
  } else {
    // Loop through all files in the folder
    while (filesIter.hasNext()) {
      var file = filesIter.next();
      var fileName = file.getName();
      var new_slide = slide_Deck.insertSlide(1);

      try {
        // Try to insert the image into the slide
        new_slide.insertImage(file);
      } catch (e) {
        // If there's an error, log the error message but continue to the next file
        mail_body += "\n" + folder + '  >> collectStudentsFileAndReturnMailBody() yielded an error for file: ' + fileName + ' - ' + e + "\n";
        console.error(mail_body);
        Logger.log(mail_body);
        sendErrorEmail(mail_body, "Student's File Collection Error!");
        continue;  // Continue to the next file
      }
    }
  }

  // Create a new slide for the folder title
  var new_slide = slide_Deck.insertSlide(1);
  var shape = new_slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 200, 200, 350, 300);  // Change position documentation: https://developers.google.com/apps-script/guides/slides/moving-elements
  var textRange = shape.getText();
  var subTitle;  // Declare subtitle variable

  // Check if the folder is more than 7 days old
  if (isFolderMoreThan7DaysOld(folder)) {
    // Update the subtitle without the random icon
    subTitle = folder.getName() + '\n(সম্ভাব্য পুরাতন বাড়ির কাজ!)\n☹️';   
    textRange.setText(subTitle);
    textRange.getTextStyle()
              .setBold(true)
              .setForegroundColor('#ff0000');
  } else {
    // If the folder is not old, add the random icon
    var icons = ['❤', '★', '☀', '☑', '♕', '🤩', '😍'];
    var randomNumber = Math.floor(Math.random() * icons.length);
    var randomIcon = icons[randomNumber];
    subTitle = randomIcon + '\n' + folder.getName();
    textRange.setText(subTitle);
    textRange.getTextStyle()
              .setForegroundColor('#0000FF')
              .setFontSize(28);
  }

  return mail_body;  // Return the accumulated mail body with any errors
}


function sendEmail(class_name, file_id, to_address, mail_body) {
  Logger.log("sendEmail function is in progress...");

  // Check if `to_address` is valid
  if (!to_address || to_address.trim() === "") {
    Logger.log("No recipient email address found for " + class_name);
    return;  // Skip sending if no valid email address is found
  }

  try {
    var file = DriveApp.getFileById(file_id);
    var today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy");
    var email_subject = "Homework for " + class_name + " on " + today_date;

    MailApp.sendEmail({
      to: to_address,
      subject: email_subject,
      htmlBody: mail_body,
      attachments: [file.getAs(MimeType.PDF)]
    });
    Logger.log("An email has been sent to " + to_address);
  } catch (error) {
    errorMessage = "Failed to send email to " + to_address + ": " + error.message;
    Logger.log(errorMessage);
    sendErrorEmail(errorMessage, "Error with email sending!");
  }
}

function sendErrorEmail(errorMessage, subjectSuffix = "Error") {
  // Define the recipient, subject, and body of the error email
  var recipient = "info@kochikachar-bornomala.de"; // Replace with the correct recipient
  var subject = "Homework Process - " + subjectSuffix;
  var body = "Dear Admin,\n\nAn error occurred during the homework process:\n\n" + errorMessage + "\n\nPlease check the logs for more details.\n\nBest regards,\nKochikachar Bornomala System";

  try {
    // Send the error notification email
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    });
    Logger.log("Error email sent to " + recipient + " with message: " + errorMessage);
  } catch (emailError) {
    Logger.log("Failed to send error email: " + emailError.message);
  }
}



function makeInitialSlides(){
  Logger.log("makeInitialSlides function is in progress...");
  var today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy");
  var presentation_name = "Homework_for_this_week_" + today_date;
  var templateId = initialTemplateId //defined in Config.gs
  var template = SlidesApp.openById(templateId);
  var fileName = template.getName();
  var templateSlides = template.getSlides();
  var newDeck = SlidesApp.create(presentation_name);

  // Remove default slides
  var defaultSlides = newDeck.getSlides();
  defaultSlides.forEach(function(slide) {
   slide.remove();
  });
  
  // Insert slides from template
 var index = 0;
 templateSlides.forEach(function(slide) {
   var newSlide = newDeck.insertSlide(index);
   var elements = slide.getPageElements();
   elements.forEach(function(element) {
     newSlide.insertPageElement(element);
   });
   index++;
 });
 return newDeck;
}

function deleteFile(myFolder) {
  Logger.log("deleteFile function is in progress...");
  var allFiles, idToDLET, myFolder, rtrnFromDLET, thisFile;

  allFiles = myFolder.searchFiles( 
      'fullText contains "Homework_for_this_week"');
  //allFiles = myFolder.getFilesByName(myFileName);

  while (allFiles.hasNext()) {//If there is another element in the iterator
    thisFile = allFiles.next();
    idToDLET = thisFile.getId();
    DriveApp.getFileById(idToDLET).setTrashed(true); 
  };
}


// deletes the folder, which is older than 7 days
function deleteOldFolder(folder) {
  var todayDate = new Date();
  var folderCreationDate = folder.getDateCreated();
  //Logger.log("The folder '" + folder + "' was created on " + folderCreationDate);
    // get milliseconds
  var t1 = todayDate.getTime();
  Logger.log("Today's date is " + t1);
  var t2 = folderCreationDate.getTime();
  Logger.log("folder Creation Date is " + t2);
  var millisecondsIn7days = 8600000 * 7;
  var diffInMilliseconds = t1 - t2;
  if (diffInMilliseconds > millisecondsIn7days){
    Logger.log("The folder '" + folder + "' is older than 7 days. Hence deleting...");
    //folder.setTrashed(true);
  }
}


// is a folder more than 7 days old
// TODO: check if it can be implemented easily:1. https://stackoverflow.com/questions/22905322/google-apps-script-search-all-documents-in-a-folder 2. https://developers.google.com/drive/api/guides/search-shareddrives
function isFolderMoreThan7DaysOld(folder) {
  var todayDate = new Date();
  var folderCreationDate = folder.getDateCreated();
  //Logger.log("The folder '" + folder + "' was created on " + folderCreationDate);
    // get milliseconds
  var t1 = todayDate.getTime();
  var t2 = folderCreationDate.getTime();
//  t2_readable = Utilities.formatDate(folderCreationDate, "GMT+1", "dd-MM-yyyy");
//  Logger.log("folder Creation Date is " + t2_readable);
  var millisecondsIn7days = 3600 * 1000 * 24 * 7;
  var diffInMilliseconds = t1 - t2;
  if (diffInMilliseconds > millisecondsIn7days){
    Logger.log("The folder '" + folder + "' is older than 7 days....");
    return true;
  }
  return false;
}

// Sort folders by descending order (Latest folder files should come first in the pdf)
function getAllFoldersInDriveDescendingOrder(folder) {
  var folderArray = [];
  var folders = folder.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    folderArray.push(folder);
  }
  folderArray.sort(function(a, b) {
    return b.getDateCreated().getTime() - a.getDateCreated().getTime();
  });
  return folderArray;
}



function createHomeWorkPDF(class_name, email_address_tosend) {

  Logger.log("Working on homework pdf creation for: " + class_name);
  Logger.log("createHomeWorkPDF function is in progress...");

  var dApp = DriveApp;
  var foldersIter = dApp.getFoldersByName(class_name);

  if (foldersIter.hasNext()) {
    var folder = foldersIter.next();
    Logger.log("Found folder: " + folder.getName());

    var subFolderIter = folder.getFolders();

    while (subFolderIter.hasNext()) {
      var subFolder = subFolderIter.next();

      if (subFolder.getName() == "০৩_বাড়ির কাজ - জমা নেওয়া") {
        var slide_Deck = makeInitialSlides();
        var sortedFolderArray = getAllFoldersInDriveDescendingOrder(subFolder);

      var mail_body = "<HTML><BODY>" +
        "Dear Concerned, <BR>" +
        "<BR>" +
        "Please find the homework file for this week in the attachment. <BR>" +
        // "<b>THIS IS A TEST EMAIL. PLEASE IGNORE.</b> <BR>" + // uncomment if it's a test email.
        "<BR>" +
        "Best regards,<BR>" +
        "Kochikachar Bornomala Online School" +
        "<BR>" +
        "<BR>" +
        "<BR>(There may be some error message below. Please contact the batch coordinator, if you don't understand them.): <BR>" +
        "</BODY></HTML>";


        for (var i = sortedFolderArray.length - 1; i > -1; i--) {
          //Logger.log('Folder Name: ' + sortedFolderArray[i].getName() + ', Created on: ' + sortedFolderArray[i].getDateCreated());
          var student_folder = sortedFolderArray[i];
          mail_body += collectStudentsFileAndReturnMailBody(student_folder, slide_Deck);
          mail_body += "<BR>";
        }
        mail_body += "</BODY></HTML>";

        var temp_slides_homework = DriveApp.getFileById(slide_Deck.getId());
        subFolder.addFile(temp_slides_homework);

        centerAllImagesInSlide(slide_Deck.getId());
        slide_Deck.saveAndClose();

        Logger.log("Deleting last week's homework pdf...");
        deleteFile(subFolder);

        Logger.log("Creating this week's homework pdf...");
        var blob = temp_slides_homework.getBlob();
        var pdf = subFolder.createFile(blob);

        Logger.log("Deleting the slides from the default template...");
        temp_slides_homework.setTrashed(true);

        Logger.log("Sending email with homework pdf...");
        sendEmail(class_name, pdf.getId(), email_address_tosend, mail_body);
      }
    }
  } else {
    errorMessage = "No folder found with the name: " + class_name;
    Logger.log(errorMessage);
    sendErrorEmail(errorMessage, "Error in folder name!");
  }
}

// this is the duplicate main function, which is used for debug and testing purpose.
function main() {
  try {
    // Get the dynamically generated email lists from the spreadsheet
    var spreadsheetId = databaseSpreadsheetId; // defined in Config.gs
    var batchSheetName = 'Batches'; // The sheet containing active schools
    var studentSheetName = 'Student'; // The sheet containing student emails
    var teacherSheetName = 'Teachers'; // The sheet containing teacher emails

    // Retrieve school emails from the specified sheet
    var schoolEmails = getEmailsBySchoolFromStudentAndTeacherSheet(spreadsheetId, studentSheetName, teacherSheetName);

    // Check if schoolEmails is empty
    if (!schoolEmails || Object.keys(schoolEmails).length === 0) {
      var errorMessage = "No emails found in the '" + studentSheetName + "' sheet. Stopping execution.";
      Logger.log(errorMessage);
      sendErrorEmail(errorMessage, "Email Retrieval Error");
      return;  // Stop further execution if empty
    }

    // Get active schools
    const activeSchools = getActiveSchools(spreadsheetId, batchSheetName, schoolEmails);

    // Check if activeSchools is empty
    if (!activeSchools || activeSchools.length === 0) {
      var errorMessage = "No active schools found in the '" + batchSheetName + "' sheet. Stopping execution.";
      Logger.log(errorMessage);
      sendErrorEmail(errorMessage, "Active Schools Retrieval Error");
      return;  // Stop further execution if empty
    }

    // Loop through each active school and call createHomeworkPDF with the school name and email list
    for (var i = 0; i < activeSchools.length; i++) {
      try {
        var schoolNameInBangla = activeSchools[i][0]; // School name in Bangla
        var email = activeSchools[i][1]; // Corresponding email

        Logger.log("Processing: school - " + schoolNameInBangla + ", email: " + email);
        createHomeWorkPDF(schoolNameInBangla, email);
      } catch (pdfError) {
        var pdfErrorMessage = "Error creating or sending homework PDF for " + activeSchools[i][0] + ": " + pdfError.message;
        Logger.log(pdfErrorMessage);
        sendErrorEmail(pdfErrorMessage, "PDF Creation Error");
      }
    }

  } catch (error) {
    var generalErrorMessage = "Error in main function: " + error.message;
    Logger.log(generalErrorMessage);
    sendErrorEmail(generalErrorMessage, "General Error");
  }
}



 // This is new main function that retrieves emails from the spreadsheet and calls createHomeworkPDF
function main_old_2() {
  try {
    // Get the dynamically generated email lists from the spreadsheet
    //var spreadsheetId = databaseSpreadsheetId; // defined in Config.gs
    var spreadsheetId = emailSpreadsheetIdTest; // defined in Config.gs
    var sheetName = 'Student'; //Make sure the sheet name in the defined spreadsheet
    var schoolEmails = getEmailsBySchoolFromDatabaseSheet(spreadsheetId, sheetName);

    // Check if schoolEmails is empty
    if (!schoolEmails || Object.keys(schoolEmails).length === 0) {
      var errorMessage = "No emails found in the '" + sheetName + "' sheet. Stopping execution.";
      Logger.log(errorMessage);
      sendErrorEmail(errorMessage, "Email Retrieval Error");
      return;  // Stop further execution if empty
    }

    // Prepare school names and emails for calling createHomeworkPDF
    var schoolsNemails = [
      ['স্কুল-০১', schoolEmails['school_01']],
      ['স্কুল-০২', schoolEmails['school_02']],
      ['স্কুল-০৩', schoolEmails['school_03']],
      ['স্কুল-০৪', schoolEmails['school_04']],
      ['স্কুল-০৫', schoolEmails['school_05']],
      ['স্কুল-০৬', schoolEmails['school_06']],
      ['স্কুল-০৭', schoolEmails['school_07']],
      ['স্কুল-০৮', schoolEmails['school_08']],
      ['স্কুল-০৯', schoolEmails['school_09']],
      ['প্রি-স্কুল-০২', schoolEmails['pre_school_02']]
    ];

    // Loop through each school and call createHomeworkPDF with the school name and email list
    for (var i = 0; i < schoolsNemails.length; i++) {
      try {
        Logger.log("Processing: school - " + schoolsNemails[i][0] + ", emails: " + schoolsNemails[i][1]);
        createHomeWorkPDF(schoolsNemails[i][0], schoolsNemails[i][1]);
      } catch (pdfError) {
        var pdfErrorMessage = "Error creating or sending homework PDF for " + schoolsNemails[i][0] + ": " + pdfError.message;
        Logger.log(pdfErrorMessage);
        sendErrorEmail(pdfErrorMessage, "PDF Creation Error");
      }
    }

  } catch (error) {
    var generalErrorMessage = "Error in main_test function: " + error.message;
    Logger.log(generalErrorMessage);
    sendErrorEmail(generalErrorMessage, "General Error");
  }
}


// this is the old main function, which calls CreateHomeworkPDF function and finalizes homework for all the batches.
function main_old()
 {
  // The email addresses are defined in the constants in Config.gs file.
  var schoolsNemails = [
                    ['স্কুল-০১', school_01_emails],
                    ['স্কুল-০২', school_02_emails],
                    ['স্কুল-০৩', school_03_emails],
                    ['স্কুল-০৪', school_04_emails],
                    ['স্কুল-০৫', school_05_emails],
                    ['স্কুল-০৬', school_06_emails],
                    ['স্কুল-০৭', school_07_emails],
                    ['স্কুল-০৮', school_08_emails],
                    ['স্কুল-০৯', school_09_emails],
                    ['প্রি-স্কুল-০২', pre_school_02_emails]
                    ];
  
  for (i = 0; i < schoolsNemails.length; i++){
      createHomeWorkPDF(schoolsNemails[i][0], schoolsNemails[i][1]);
  }
 }
