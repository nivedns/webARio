var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();


//Jquery DOM
  var noteTextarea = $('#note-textarea');
  var instructions = $('#recording-instructions');
  var notesList = $('ul#notes');
  var noteContent = '';
  


  // Get all notes from previous sessions and display them.
  var notes = getAllNotes();
  renderNotes(notes);
  
  

  recognition.continuous = true;

  recognition.onresult = function(event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
    console.log(transcript);
  
    if(!mobileRepeatBug) {
      noteContent += transcript;
      noteTextarea.val(noteContent);
    }
  };
  
  recognition.onstart = function() { 
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
  }
  
  recognition.onspeechend = function() {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
  }
  
  recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
      instructions.text('No speech was detected. Try again.');  
    };
  }
  
  
  
 //DOM manupulation
  
  $('#startbtn').on('click', function(e) {
    if (noteContent.length) {
      noteContent += ' ';
    }
    recognition.start();
  });
  
  
  $('#pausebtn').on('click', function(e) {
    recognition.stop();
    instructions.text('Voice recognition paused.');
  });
  
  noteTextarea.on('input', function() {
    noteContent = $(this).val();
  })
  
  $('#savebtn').on('click', function(e) {
    recognition.stop();
  
    if(!noteContent.length) {
      instructions.text('Could not save empty note. Please add a message to your note.');
    }
    else {
      saveNote(new Date().toLocaleString(), noteContent);
      noteContent = '';
      renderNotes(getAllNotes());
      noteTextarea.val('');
      instructions.text('Note saved successfully.');
    }
        
  })
  
  
  notesList.on('click', function(e) {
    e.preventDefault();
    var target = $(e.target);
  
    // Listen to the selected note.
    if(target.hasClass('listen-note')) {
      var content = target.closest('.note').find('.content').text();
      readOutLoud(content);
    }
  
    // Delete note.
    if(target.hasClass('delete-note')) {
      var dateTime = target.siblings('.date').text();  
      deleteNote(dateTime);
      target.closest('.note').remove();
    }
  });
  
  
  
//STT
  function readOutLoud(message) {
      var speech = new SpeechSynthesisUtterance();
  
    // Set the text and voice attributes.
      speech.text = message;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
    
      window.speechSynthesis.speak(speech);
  }


//Other functions
  
  function renderNotes(notes) {
    var html = '';
    if(notes.length) {
      notes.forEach(function(note) {
        html+= `<li class="note">
          <p class="header">
            <span class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
            <a href="#" class="delete-note" title="Delete">Delete</a>
            <a id="download_link" download="notes.txt" href="" >Download</a>
          </p>
          <p class="content">${note.content}</p>
        </li>`;   
        // var data = new Blob([note.content], {type: 'text/plain'});
        // var url = window.URL.createObjectURL(data);
        // document.getElementById('download_link').href = url; 
      });
    }
    else {
      html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    }
    notesList.html(html);
  }
  
  
  function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
  }
  
  
  function getAllNotes() {
    var notes = [];
    var key;
    for (var i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
      console.log(i)
      console.log(key)
  
      if(key.substring(0,5) == 'note-') {
        notes.push({
          date: key.replace('note-',''),
          content: localStorage.getItem(localStorage.key(i))
        });
      } 
    }
    console.log(notes)
    return notes;
  }
  
  
  function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime); 
  }