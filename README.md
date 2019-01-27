# remf-server
A lightweight, simple file-transfer service server.

## Features

#### 1. No registration

All you need to do to use this service is just login. There's no sign up!

#### 2. Easy, simple, convenient file transfer

Type recipients, attach files, and press the send button! The recipients will receive this message soon!

#### 3. Any platform

Send your desktop files to mobile devices. Send anywhere, to everywhere!

#### 4. Multiple file attach support

Did you find funny comics from internet? Let's share it with your friends! Remf can handle many files simultaneously. Just attach it!

## API

### Session

- `POST` `/session`
- `DELETE` `/session/<sessionId>`

### Message

- `POST` `/message?sessionId=<sessionId>`
- `GET` `/message/<messageId>?sessionId=<sessionId>`
- `PUT` `/message/<messageId>?sessionId=<sessionId>`

### Content

- `GET` `/content/<contentId>?sessionId=<sessionId>`
