set main_homework="C:\hw-assist\homework"
set new_homework="C:\hw-assist\all_homeworks\"
if not exist %new_homework% (
	echo folder does not exists. creating...
	md %new_homework%
    )

cd /d %main_homework%
for /r %%d in (*) do copy "%%d" %new_homework%