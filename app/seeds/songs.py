from app.models.db import db, environment, SCHEMA
from app.models import Song
from sqlalchemy.sql import text

def seed_songs():
    song1 = Song(
        user_id=1,
        name='Breezy',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=210,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Breezy.mp3'
    )
    song2 = Song(
        user_id=1,
        name='Compression of Time',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=180,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Compression_of_Time.mp3'
    )
    song3 = Song(
        user_id=2,
        name='Ending Theme',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=800,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Ending_Theme.mp3'
    )
    song4 = Song(
        user_id=2,
        name='Eyes on Me',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=338,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Eyes_on_Me.mp3'
    )
    song5 = Song(
        user_id=3,
        name='Junction',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=95,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Junction.mp3'
    )
    song6 = Song(
        user_id=1,
        name='Lunatic Pandora',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=193,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Lunatic_Pandora.mp3'
    )
    song7 = Song(
        user_id=1,
        name='Ami',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=268,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Ami.mp3'
    )
    song8 = Song(
        user_id=1,
        name='Fragments of Memories',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=188,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Fragments_of_Memories.mp3'
    )
    song9 = Song(
        user_id=1,
        name='Find Your Way',
        artist='FF8',
        album='OST',
        genre='RPG',
        duration=324,
        file_url='https://tunes-and-more-music.s3.us-east-1.amazonaws.com/FF8-OST-Find_Your_Way.mp3'
    )

    db.session.add(song1)
    db.session.add(song2)
    db.session.add(song3)
    db.session.add(song4)
    db.session.add(song5)
    db.session.add(song6)
    db.session.add(song7)
    db.session.add(song8)
    db.session.add(song9)

    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.songs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))
    db.session.commit()
