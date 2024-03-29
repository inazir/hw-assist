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

function collectStudentsFile(folder,slide_Deck){
  Logger.log("collectStudentsFile function is in progress on the folder: " + folder.getName());
  var mail_body = '';
  var filesIter = folder.getFiles();
  while (filesIter.hasNext())
  {
    var file = filesIter.next();
    var fileName = file.getName();
    new_slide = slide_Deck.insertSlide(1);
    //new_slide.insertPageElement()
    //var position = {left: 50, top: 0};
    //var size = {width: file.width, height: file.height};

    try{
      new_slide.insertImage(file);
    } catch (e){
      mail_body = mail_body + "\n" + folder +'  >> collectStudentsFile() yielded an error: ' + e + "\n";
      console.error(mail_body);
      Logger.log(mail_body);
    }
  }

  var new_slide = slide_Deck.insertSlide(1);
  const shape = new_slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 300, 150, 300, 100);
  var text= shape.getText();
  const textRange = shape.getText();
  textRange.setText(folder.getName());
  return mail_body;
}


function sendEmail(class_name, file_id, to_address, mail_body){
  Logger.log("sendEmail function is in progress...");
  var file = DriveApp.getFileById(file_id);
  var today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy");
  var email_subject = "Homework for " + class_name + " on " + today_date ;

  MailApp.sendEmail({
    to: to_address,
    subject: email_subject,
    htmlBody: mail_body,
    attachments: [file.getAs(MimeType.PDF)]
  });
  Logger.log("An email has been set to " + to_address);
}

function makeInitialSlides(){
  Logger.log("makeInitialSlides function is in progress...");
  var today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy");
  var presentation_name = "homework_for_this_week";
  var templateId= "1H0ZS5nsc_a33MkgF5nHxnqZfbHsW0CZ7GX6dIoIR6WY"; //// Template location-> Kochikachar Bornomala/Designs and Media/KochikacaharBornomalaHomeWorkTemplate
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

function deleteFile(myFileName, myFolder) {
  Logger.log("deleteFile function is in progress...");
  var allFiles, idToDLET, myFolder, rtrnFromDLET, thisFile;

  allFiles = myFolder.getFilesByName(myFileName);

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
  Logger.log("The folder '" + folder + "' was created on " + folderCreationDate);
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

function createHomeWorkPDF(class_name,email_address_tosend) {
  Logger.log("Working on homework pdf creation for: " + class_name);
  Logger.log("createHomeWorkPDF function is in progress...");
  var dApp = DriveApp;
  var foldersIter = dApp.getFoldersByName(class_name);
  var folder = foldersIter.next();
  var subFolderIter= folder.getFolders();

  while (subFolderIter.hasNext()){
    var folder = subFolderIter.next();
    if (folder.getName()=="০৩_বাড়ির কাজ - জমা নেওয়া"){
      var slide_Deck = makeInitialSlides();
      var subFolderIter= folder.getFolders();
      var mail_body = "<HTML><BODY>"+"Dear Concerned, <BR>" 
+ "<BR>"
+ "Please find the homework file for this week in the attachment. <BR>"
+ "<BR>"
+ "Best regards,<BR>"
+ "Batch Coordinator <BR>"
+ "Kochikachar Bornomala Online School"
+ "<BR>"
+ "<BR>"
+"<BR>(There may be some error messages below. Please consult the batch coordinator, if you don't understand them.): <BR>";

      while (subFolderIter.hasNext()){
        var student_folder = subFolderIter.next();
        // delete folder older than 7 days
        //deleteOldFolder(student_folder); // check miliseconds calcualtion again

        mail_body += collectStudentsFile(student_folder,slide_Deck);
        mail_body = mail_body + "<BR>" + "</BODY></HTML>"; 
      }

      var temp_slides_homwork = DriveApp.getFileById(slide_Deck.getId());
      folder.addFile(temp_slides_homwork);
      centerAllImagesInSlide(slide_Deck.getId())

      slide_Deck.saveAndClose();
      // Delete last week homework pdf.
      Logger.log("Deleting last week's homework pdf...");
      deleteFile("homework_for_this_week.pdf", folder);

      //make pdf
      const id = temp_slides_homwork.getId();
      const  blob = DriveApp.getFileById(id).getBlob();
      Logger.log("Creating this week's homework pdf...");
      pdf = folder.createFile(blob); 

      //delete slides to make the template fresh again..
      Logger.log("Deleting the slides from the default template..");
      DriveApp.getFileById(id).setTrashed(true); 

      Logger.log("Sending email with homework pdf...");
      sendEmail(class_name, pdf.getId(),email_address_tosend, mail_body);
    }
  }
}

function prepareHomweork()
 {
  // The email addresses are defined in the constants in Config.gs file.
  createHomeWorkPDF("স্কুল_01",school_01_emails); // school_01_emails is a constant defined in a separete file called config.gs e.g. const school_01_emails = "info@kochikachar-bornomala.de,diponminhaz@gmail.com";
  createHomeWorkPDF("স্কুল_02",school_02_emails);
  createHomeWorkPDF("স্কুল_03",school_03_emails);
  createHomeWorkPDF("স্কুল_04",school_04_emails);
  createHomeWorkPDF("প্রিস্কুল_02",pre_school_02_emails);
 }
