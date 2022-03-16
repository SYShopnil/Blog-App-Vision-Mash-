# WebMag Blog APP (Vision Mash)

It is a blog app project. Where people can post there own blog including update and delete also. And others unregisterd or registerd both user can see all blog.
This is my Personal Project. I am doing as my Internship project.

## Key Technologies

**Client-Side:** Next js, Redux, TailwindCSS

**Server-Side:** Node JS, Express JS, GraphQL

**Database:** MongoDB (with ODM mongoose)

## Key Roles

- Admin
- Blogger

## Key Features

- Blogger and Admin need to make a registration process.
- If user forgot password then a 6 digits OTP will sent to their contact number or email. And after verify it user can recover their forgot password.
- User can update there password but to update their exist password he/she needs to put their current password and then he or she can able to update their exist password.
- If user dont want to upload any profile or cover picture during registration time then a default profile picture will be upload according to the user's gender.
- Blogger and Admin has there own Unique user Id which will be generate during the registration time.
- Authentic user can comment including reply on any blog.
- Blogger can post a new blog in three ways. Blogger can direct post the blog. Blogger can save the Blog and later on post it.
- All user can see all published blog. And also can filter blog by many ways inclduding sorting.
- In the time blog showing to the user Pagination facilites is available.
- Outside user can contact with the autority by using fill up a contact us form which contains a email with content. And this message will go to the autorities and autority will reply that message via that provided email.

## Demo

Ongoing Project......

## Run Locally

Clone the project

```bash
  git clone https://github.com/SYShopnil/Blog-App-Vision-Mash-BackEnd.git
```

Go to the project directory

```bash
  cd Blog-App-Vision-Mash-BackEnd
```

Install dependencies

```bash
  npm install || npm i
```

Start the server

```bash
  npm run dev
```

## Installation

Install my-project with npm

```bash
  npm install || npm i
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

**`SERVER_URL`** //it will be the server side port

**`MONGO_URL`** //it wil be the mongodb database local or cloud server link.

**`DATA_URL`** // it will be the client side link

**`COOKIE_EXPIRE`** //it will be the cookie expire time in day (0-9) any number.

**`TOKEN_EXPIRE`** //it will be the Json Web token expire time in day (0-9) any number.

**`TWILIO_ACCOUNT_SID`** //it will be the twillio acount sid number

**`TWILIO_AUTH_TOKEN`** //it will be the twillio atuh token.

**`TWILIO_ADMIN_NUMBER`** //it will be the twillio admin number.

**`HOST_EMAIL`** // it will be a valid email for nodeMailer host mail. to use this you should have enable low security of you gmail.

**`HOST_PASSWORD`** // it will be a valid email password for nodeMailer host mail. to use this you should have enable low security of you gmail.

**`SENDER_EMAIL`** //it will be a valid email.

**`PASSWORD_RESET_TOKEN_TIME`** // it will be the time of how many time the password reset token have in ("0.5h") formate.

**`PASSWORD_RESET_COOKIE_TIME`** //it will be a time in this format 0.021.

**`FORGOT_PASSWORD_USER_COOKIE_NAME`** // it will be any name which set the name of forgot password time cookie name.

**`BLOG_SINGLE_PAGE_URL`** //it will contain the blog individual page client side url.

## Documentation

[Project Overview](https://drive.google.com/file/d/16myre9dRR38-0LqBv1G5dh4hNP9w8v5K/view?usp=sharing)

[Database Design](https://drive.google.com/file/d/1UMgyleuiFniimXcNY5vmIdtJ1NB93m5-/view?usp=sharing)

[API- Overview](https://drive.google.com/file/d/1V6KNtxFX3Nx1Y2cW3L15x4H_1Oqtjmjj/view?usp=sharing)

[API- Doc](https://drive.google.com/file/d/13IaYjFhswZ73yFSSkWLgfYkug_wLThfR/view?usp=sharing)

## Support

For support, info@visionmash.com .
