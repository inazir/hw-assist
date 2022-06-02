# hw-assist
This project helps to collect homeworks from the students. There are two main scripts:
- The first one is to collect homeworks from students 
- The second one is to make pdf and send as email

## Collect homeworks through google forms
- This script works in combination with the google form (বাড়ির কাজ । স্কুল-০x । কচিকাঁচার বর্ণমালা)
- To open this script, Click on the three dot of the google form-> Script editor
- There has to be parent folder in drive upon which the subfolders will be created. In this script the parent folder ID is saved under constant PARENT_FOLDER_ID
- If used for the for the first time (of after any change), the 'initialize' function has to be run once, which will create a new trigger.
- This 'initialize' run will ask for permission to the corresponding parent folder folder, which has to be granted.
- Then 'OnFormSubmit' function has to be run once too, so that from the next form submission onward, the script can work accordingly.
- Current tirggers and execution logs are helpful for debugging.

## Make pdf and send as email
- The second script reads the homeworks image files from the following locations for each batch:
  Kochikachar Bornomala/কচিকাচার বর্ণমালা-লেখাপড়া/স্কুল_০X/০৩_বাড়ির কাজ জমা নেয়া
- Create a google slide and the convert it into a combined pdf.
- Send the combined pdf to a desired email address.