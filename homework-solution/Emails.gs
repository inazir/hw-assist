function getEmailsBySchoolFromStudentAndTeacherSheet(spreadsheetId, studentSheetName, teacherSheetName) {
  var separateSpreadsheet;
  
  // Try to open the spreadsheet and handle error if it doesn't exist
  try {
    separateSpreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } catch (e) {
    Logger.log("Error: The spreadsheet with ID '" + spreadsheetId + "' does not exist or is inaccessible.");
    return {}; // Return empty if spreadsheet cannot be accessed
  }

  // Process the Student Sheet
  var studentSheet = separateSpreadsheet.getSheetByName(studentSheetName);
  if (!studentSheet) {
    Logger.log("Error: The student sheet '" + studentSheetName + "' does not exist in the spreadsheet.");
    return {}; // Return empty if student sheet is missing
  }

  var dataRange = studentSheet.getDataRange();
  var values = dataRange.getValues();

  var schoolEmails = {};
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Normalize headers to lowercase for case-insensitive lookup
  var headers = values[0].map(header => header.toLowerCase());
  var classIdIndex = headers.indexOf("class_id");
  var emailIndex = headers.indexOf("email");
  var statusIndex = headers.indexOf("current_status");

  if (classIdIndex === -1 || emailIndex === -1 || statusIndex === -1) {
    Logger.log("Error: 'Class_id', 'email', or 'Current_Status' column not found in student sheet.");
    return {}; // Return if required columns are missing
  }

  // Process each row in the Student sheet
  for (var i = 1; i < values.length; i++) {
    var classId = values[i][classIdIndex];
    var emailField = values[i][emailIndex];
    var status = values[i][statusIndex];

    // Only process emails for Active students (case-insensitive check)
    if (classId && emailField && status.toLowerCase() === "active") {
      var formattedClassId = classId.toLowerCase().replace(/ /g, "_");
      if (!schoolEmails[formattedClassId]) {
        schoolEmails[formattedClassId] = ["info@kochikachar-bornomala.de"];
      }

      var emailArray = emailField.split(/[,;|\s]+/);
      emailArray.forEach(function(email) {
        email = email.trim();
        if (email && emailRegex.test(email)) {
          if (!schoolEmails[formattedClassId].includes(email)) {
            schoolEmails[formattedClassId].push(email);
          }
        }
      });
    }
  }

  // Attempt to process the Teacher Sheet, log a warning if it doesn't exist
  var teacherSheet = separateSpreadsheet.getSheetByName(teacherSheetName);
  if (!teacherSheet) {
    Logger.log("Warning: The teacher sheet '" + teacherSheetName + "' does not exist in the spreadsheet.");
  } else {
    var teacherDataRange = teacherSheet.getDataRange();
    var teacherValues = teacherDataRange.getValues();

    // Normalize headers in Teacher sheet for case-insensitive lookup
    var teacherHeaders = teacherValues[0].map(header => header.toLowerCase());
    var teacherClassIndex = teacherHeaders.indexOf("teacher_class_id");
    var teacherEmailIndex = teacherHeaders.indexOf("email");

    if (teacherClassIndex === -1 || teacherEmailIndex === -1) {
      Logger.log("Error: 'Teacher_Class_ID' or 'email' column not found in teacher sheet.");
    } else {
      // Process each row in the Teacher sheet
      for (var j = 1; j < teacherValues.length; j++) {
        var classList = teacherValues[j][teacherClassIndex];
        var teacherEmail = teacherValues[j][teacherEmailIndex];

        if (classList && teacherEmail && emailRegex.test(teacherEmail)) {
          var classes = classList.split(/[,;|\s]+/);
          classes.forEach(function(classId) {
            var formattedClassId = classId.toLowerCase().replace(/ /g, "_");
            if (!schoolEmails[formattedClassId]) {
              schoolEmails[formattedClassId] = ["info@kochikachar-bornomala.de"];
            }

            if (!schoolEmails[formattedClassId].includes(teacherEmail)) {
              schoolEmails[formattedClassId].push(teacherEmail);
            }
          });
        }
      }
    }
  }

  // Convert each class's email list to a single comma-separated string
  for (var school in schoolEmails) {
    schoolEmails[school] = schoolEmails[school].join(',');
  }

  return schoolEmails;
}

// Simple call function
function callGetEmailsBySchool() {
  var spreadsheetId = databaseSpreadsheetId;
  var studentSheetName = "Student";
  var teacherSheetName = "Teachers";

  var schoolEmails = getEmailsBySchoolFromStudentAndTeacherSheet(spreadsheetId, studentSheetName, teacherSheetName);
  // Sort the class names (keys) alphabetically
  var sortedClassNames = Object.keys(schoolEmails).sort();

  // Print each class name and its email list
  sortedClassNames.forEach(function(className) {
    Logger.log("Class: " + className + "\nEmails: " + schoolEmails[className]);
  });
}

function getActiveSchools(spreadsheetId, batchSheetName, schoolEmails) {

  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(batchSheetName);
  const data = sheet.getDataRange().getValues();

  // Assuming the first row is headers, we start from the second row
  const schoolsNemails = data.slice(1)  // Ignore headers
    .filter(row => row[2].toLowerCase() === 'active') // Check if status is "active"
    .map(row => {
      const schoolId = row[0]; // Assuming school_id is in the first column
      const schoolNameInBangla = row[1]; // Assuming drive_folder_name_in_bangla is in the second column
      const email = schoolEmails[schoolId]; // Get email from schoolEmails map
      return [schoolNameInBangla, email];
    })
    .filter(row => row[1] !== undefined); // Filter out entries without email

  console.log(schoolsNemails);
  return schoolsNemails;
}

function runExample() {
  var batchSheetName = 'Batches'; // Replace with your batch sheet name
  var spreadsheetId = databaseSpreadsheetId; // Assuming this variable is defined elsewhere in your code
  var studentSheetName = "Student"; // Replace with your student sheet name
  var teacherSheetName = "Teachers"; // Replace with your teacher sheet name

  var schoolEmails = getEmailsBySchoolFromStudentAndTeacherSheet(spreadsheetId, studentSheetName, teacherSheetName);
  
  const activeSchools = getActiveSchools(spreadsheetId, batchSheetName, schoolEmails);

  // Print the school names in Bangla
  activeSchools.forEach(function(school) {
    const schoolNameInBangla = school[0]; // The first element in the array is the school name
    console.log(schoolNameInBangla); // Print the school name
  });
}



