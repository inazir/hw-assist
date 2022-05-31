function centerAllImagesInSlide(slideID) {
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

  var log_msg = '';
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
      log_msg = log_msg + "\n" + folder +'  >> collectStudentsFile() yielded an error: ' + e + "\n";
      console.error(log_msg);
    }
  }

  var new_slide = slide_Deck.insertSlide(1);
  const shape = new_slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 300, 150, 300, 100);
  var text= shape.getText();
  const textRange = shape.getText();
  textRange.setText(folder.getName());
  return log_msg;
}


function sendEmail(class_name, file_id, to_address, log_msg)
{
  var file = DriveApp.getFileById(file_id);
  var today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy")
  var email_subject = "Homework for " + class_name + " on " + today_date ;

  MailApp.sendEmail({
    to: to_address,
    subject: email_subject,
    htmlBody: log_msg,
    attachments: [file.getAs(MimeType.PDF)]
  });
  Logger.log("An email has been set to " + to_address);
}

function makeInitialSlides(class_name){
  today_date = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy")
  var presentation_name = class_name + "_homework_" + today_date ;
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

function createHomeWorkPDF(class_name,email_address_tosend) {
  var dApp = DriveApp;
  var foldersIter = dApp.getFoldersByName(class_name);
  var folder = foldersIter.next();
  var subFolderIter= folder.getFolders();

  while (subFolderIter.hasNext())
  {
    var folder = subFolderIter.next();

    if (folder.getName()=="০৩_বাড়ির কাজ - জমা নেওয়া")
    {
      var slide_Deck = makeInitialSlides(class_name);
      var subFolderIter= folder.getFolders();
      var log_msg = "<HTML><BODY>"
+" <BR> Below are the possible error message. Please consult the batch coordinator, if you don't understand them: <BR>";

      while (subFolderIter.hasNext())
      {
        var student_folder = subFolderIter.next();
        log_msg += collectStudentsFile(student_folder,slide_Deck);
        log_msg = log_msg + "<BR>" + "</BODY></HTML>"; 
      }

      var temp_slides_homwork = DriveApp.getFileById(slide_Deck.getId());
      folder.addFile(temp_slides_homwork);
      centerAllImagesInSlide(slide_Deck.getId())

      slide_Deck.saveAndClose();

      //makde pdf
      const id = temp_slides_homwork.getId();
      const  blob = DriveApp.getFileById(id).getBlob();
      pdf = folder.createFile(blob); 

      //delete slides 
      DriveApp.getFileById(id).setTrashed(true); 

      Logger.log (pdf.getId());

      sendEmail(class_name, pdf.getId(),email_address_tosend, log_msg);
    }
  }
}

function prepareHomweork()
 {
  createHomeWorkPDF("স্কুল_02","kochikachar.bornomala.21c1b2@gmail.com");
  //createHomeWorkPDF("স্কুল_02","secondschoolemailaddres");

 }