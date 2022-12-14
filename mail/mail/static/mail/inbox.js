document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', email_submit);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function email_submit(event) {

  event.preventDefault()

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');
  return false;
};


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
  emails.forEach(email => {
    const element = document.createElement('div');
    element.id = "element";
    element.className = email['read'] ? "p-3 mb-2 read-color" : "p-3 mb-2 unread-color";
    element.innerHTML = `
    <span><strong>${email['sender']}</strong></span>
    <span>${email['subject']}</span>
    <span>${email['timestamp']}</span>
    `;
    element.addEventListener('click', function() {
      load_email(email['id']);
      console.log('This element has been clicked!');

      fetch(`/emails/${email['id']}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    
      console.log('markas_read finished running')

    });
    document.querySelector('#emails-view').append(element);
    });

  });

  function load_email(id) {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
  
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);
  
        // ... do something else with email ...
        const element = document.querySelector('#email-view');
        element.innerHTML = `
        <div><strong>From : </strong>${email['sender']}</div>
        <div><strong>To: </strong>${email['recipients']}</div>
        <div><strong>Subject: </strong>${email['subject']}</div>
        <div><strong>At: </strong>${email['timestamp']}</div>
        <br>
        <div>
        <p>${email['body']}</p>
        </div>
        <br>
        `;
  
        const reply_button = document.createElement('button');
        reply_button.className = "btn btn-outline-primary";
        reply_button.innerHTML = "Reply";
        reply_button.addEventListener('click', () => {
          compose_email();
          const re = email.subject.slice(0, 2) === 'Re' ? '' : 'Re: ';
          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-subject').value = re + email.subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;  
  
        });
  
        element.appendChild(reply_button);
        
        if (mailbox !== 'sent') {
  
        const archive_button = document.createElement('button');
        archive_button.className = "btn btn-outline-primary";
        archive_button.id = "archive-btn";
        archive_button.innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
        archive_button.addEventListener('click', () => {
          if (archive_button.innerHTML === 'Archive') {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            });
          } else {
            fetch(`/emails/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            });
          }
  
          load_mailbox('inbox');
        })
  
        element.appendChild(archive_button);
  
        }
    });
  }  
}

