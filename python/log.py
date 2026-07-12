from tkinter import *
from tkinter import messagebox
from PIL import Image, ImageTk

import os
import sys

# import sqlite3  # If you're planning to use SQLite, uncomment and add necessary code

# Import the IMS class if it's in the dashbord.py file
# from dashbord import IMS

root = Tk()
# root.configure(bg="light yellow")
# root.geometry("1350x700+0+0")
# -------------------Background Image----------------------------

# Adjust size
root.geometry("400x400")

# Add image file
img = Image.open("img6.jpg")
img_resized = img.resize((1700, 900), Image.Resampling.LANCZOS)

bg = ImageTk.PhotoImage(img_resized)

# Show image using label
label1 = Label(root, image=bg)
label1.place(x=0, y=0, relwidth=1, relheight=1)

label1.image = bg

# -----------------------------------------------
unm = StringVar()
pwd = StringVar()


def log():
    username = unm.get()
    password = pwd.get()

    if username == "Admin" and password == "1234":
        messagebox.showinfo("", "Login successful")

        # If IMS is a class from the dashbord.py file, this is how you can instantiate it:
        # root.destroy()  # Optional: to close the login window when the new window appears
        # new_win = Toplevel(root)
        # ims_obj = IMS(new_win)

        # Or, if you prefer to use the system call (this is less efficient):
        os.system(f'"{sys.executable}" dashbord.py')

    else:
        messagebox.showerror("Error", "Incorrect username or password")


label1 = Label(root, text="Perfume Shop Bill Management System", bg="hot pink", fg="black", bd=5, relief=GROOVE,
               font=("Times new roman", 30, "bold"))
label1.place(x=0, y=0, relwidth=1)

label2 = Label(root, text="Username:", font=("Times new roman", 20, "bold"), bg="hot pink", fg="black")
label2.place(x=310, y=190)

label3 = Label(root, text="Password:", font=("Times new roman", 20, "bold"), bg="hot pink", fg="black")
label3.place(x=310, y=340)

entry1 = Entry(root, font=("Times New Roman", 20, "bold"), bg="pink", textvariable=unm)
entry1.place(x=600, y=200)

entry2 = Entry(root, font=("Times New Roman", 20, "bold"), bg="pink", show="*", textvariable=pwd)
entry2.place(x=600, y=350)

button = Button(root, text="Login", bg="hot pink", font=("Times new roman", 20, "bold"), bd=5, command=log)
button.place(x=700, y=500)

root.mainloop()
