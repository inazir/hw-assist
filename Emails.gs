
function getEmailsBySchool(spreadsheetId, sheetName) {
  // Replace with the ID of the separate spreadsheet
  //var spreadsheetId = emailSpreadsheetId; //defined in Config.gs
  var separateSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = separateSpreadsheet.getSheetByName(sheetName);  // Update sheet name if needed
  
  // Get the range with all data
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();  // Get all values from the sheet as a 2D array

  // Initialize an object to store each school’s emails
  var schoolEmails = {};

  // Email validation regex
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Loop through each column (each school)
  for (var col = 0; col < values[0].length; col++) {
    var emails = new Set(); // Use a Set to automatically handle duplicates
    
    // Add "info@kochikachar-bornomala.de" to each school's email list
    emails.add("info@kochikachar-bornomala.de");

    // Get school name from the first row
    var schoolNameRaw = values[0][col];  // First row value of the current column
    var schoolName = schoolNameRaw.toLowerCase().replace(/ /g, "_");  // Format: school_01_, pre_school_02, etc.

    // Loop through each row in the current column
    for (var row = 1; row < values.length; row++) { // Start from row 1 to skip the header
      var email = values[row][col] ? values[row][col].trim() : ''; // Ensure email is non-null and trimmed
      if (email && emailRegex.test(email)) {  // Only add if there's a valid email
        emails.add(email);
      } else if (email) {
        Logger.log("Invalid email found and skipped: " + email);
      }
    }
    
    // Concatenate emails without quotes and store in the object
    schoolEmails[schoolName] = Array.from(emails).join(',');
  }

  Logger.log("This function returns the following:");
  Logger.log(schoolEmails);
  return schoolEmails;
}

function getEmailsBySchoolFromDatabaseSheet(spreadsheetId, sheetName) {
  var separateSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = separateSpreadsheet.getSheetByName(sheetName);  // Use the 'Student' sheet

  // Check if the sheet exists
  if (!sheet) {
    Logger.log("Error: The sheet '" + sheetName + "' does not exist in the spreadsheet.");
    return {};  // Return an empty object if the sheet is not found
  }

  // Get all data from the sheet
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();  // Get all values from the sheet as a 2D array
  
  // Initialize an object to store emails by school
  var schoolEmails = {};

  // Email validation regex
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Identify column indices based on header row
  var headers = values[0];
  var classIdIndex = headers.indexOf("Class_id");
  var emailIndex = headers.indexOf("email");

  // Check if both 'Class_id' and 'email' columns exist
  if (classIdIndex === -1 || emailIndex === -1) {
    Logger.log("Error: 'Class_id' or 'email' column not found.");
    return {};
  }

  // Process each row, starting from the second row to skip headers
  for (var i = 1; i < values.length; i++) {
    var classId = values[i][classIdIndex];
    var emailField = values[i][emailIndex];

    // Validate and process only if classId and email field are present
    if (classId && emailField) {
      // Format class ID as lowercase and underscores
      var formattedClassId = classId.toLowerCase().replace(/ /g, "_");
      
      // If this school ID is not yet in the object, initialize an array with "info@test.de"
      if (!schoolEmails[formattedClassId]) {
        schoolEmails[formattedClassId] = ["info@kochikachar-bornomala.de"];
      }

      // Split the email field by common delimiters and validate each one
      var emailArray = emailField.split(/[,;|\s]+/);  // Split by comma, semicolon, pipe, or whitespace
      emailArray.forEach(function(email) {
        email = email.trim();  // Trim any extra whitespace around each email
        if (email && emailRegex.test(email)) {  // Validate the email
          // Add email if it's not already in the list (to handle duplicates)
          if (!schoolEmails[formattedClassId].includes(email)) {
            schoolEmails[formattedClassId].push(email);
          }
        }
      });
    }
  }

  // Convert each school's email list to a single quoted string
  for (var school in schoolEmails) {
    schoolEmails[school] = schoolEmails[school].join(',');
    //Logger.log(school + ": " + schoolEmails[school]);
  }

  Logger.log(schoolEmails);  // Log the output for verification
  return schoolEmails;
}

function displaySchoolEmails() {
  var spreadsheetId = emailSpreadsheetId; //defined in Config.gs
  //var spreadsheetId = databaseSpreadsheetId; //defined in Config.gs
  // Call the getEmailsBySchool function to get the emails object
  var schoolEmails = getEmailsBySchool(spreadsheetId, 'Student');
  
  // Loop through each school in the object and log the emails to the console
  for (var school in schoolEmails) {
    Logger.log(typeof school);
    Logger.log(typeof schoolEmails[school]);
    Logger.log("School is: " + school + " and emails list: " + schoolEmails[school]);
  }
}

function displaySchoolEmailsDatabase() {
  var spreadsheetId = databaseSpreadsheetId; //defined in Config.gs
  // Call the getEmailsBySchool function to get the emails object
  var schoolEmails = getEmailsBySchoolFromDatabaseSheet(spreadsheetId, 'Student');
  
  // Loop through each school in the object and log the emails to the console
  for (var school in schoolEmails) {
    Logger.log(typeof school);
    Logger.log(typeof schoolEmails[school]);
    Logger.log("School is: " + school + " and emails list: " + schoolEmails[school]);
  }
}
