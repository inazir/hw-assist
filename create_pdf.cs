function collectStudentsFile(folder,slide_Deck){

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
       console.error(folder+'  >> collectStudentsFile() yielded an error: ' + e );
    }

  }

  var new_slide = slide_Deck.insertSlide(1);
  const shape = new_slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 300, 150, 300, 100);
  var text= shape.getText();
 
  const textRange = shape.getText();
 
  textRange.setText(folder.getName());

}


function sendEmail(file_id,to_address)
{
  var file = DriveApp.getFileById(file_id);

  MailApp.sendEmail({
    to: to_address,
    subject: "The form to fill",
    htmlBody: "The log message",
    attachments: [file.getAs(MimeType.PDF)]
  });
  Logger.log("An email has been set to "+to_address);
}

function makeInitialSlides(){

  var templateId= "1H0ZS5nsc_a33MkgF5nHxnqZfbHsW0CZ7GX6dIoIR6WY";

  var template = SlidesApp.openById(templateId);
  var fileName = template.getName();
  var templateSlides = template.getSlides();


  var newDeck = SlidesApp.create("Homework");

  //var newDeck = folder.createFile('Homework', '', MimeType.GOOGLE_SLIDES);

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
      var slide_Deck = makeInitialSlides();
      var subFolderIter= folder.getFolders();

      while (subFolderIter.hasNext())
      {
        var student_folder = subFolderIter.next();
        collectStudentsFile(student_folder,slide_Deck);
       
      }

      var temp_slides_homwork = DriveApp.getFileById(slide_Deck.getId());
      folder.addFile(temp_slides_homwork);
      slide_Deck.saveAndClose();

      //makde pdf
      const id = temp_slides_homwork.getId();
      const  blob = DriveApp.getFileById(id).getBlob();
      pdf = folder.createFile(blob); 

      //delete slides 
      DriveApp.getFileById(id).setTrashed(true); 

      Logger.log (pdf.getId());

      sendEmail(pdf.getId(),email_address_tosend);


    }
  }

}




function prepareHomweork()
 {
  createHomeWorkPDF("স্কুল_01","tomonir@gmail.com");
  createHomeWorkPDF("স্কুল_02","tomonir@gmail.com");

 }
