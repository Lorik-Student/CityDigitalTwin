ALTER TABLE Cities
ADD COLUMN image_url TEXT;

UPDATE Cities
SET image_url = CASE name
    WHEN 'Prizren' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Prizren_Fortress_07.jpg?width=900'
    WHEN 'Prishtina' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Pristina.jpg?width=900'
    WHEN 'Gjakova' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Panoramic_view_-_Gjakova.JPG?width=900'
    WHEN 'Peja' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Peja.jpg?width=900'
    WHEN 'Mitrovica' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Mitrovica_City.jpg?width=900'
    WHEN 'Ferizaj' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Ferizaj2.JPG?width=900'
    WHEN 'Gjilan' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/City_of_Gjilan.jpg?width=900'
    WHEN 'Vushtrri' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Castle_of_Vushtrria.jpg?width=900'
    WHEN 'Suharekë' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/WK402_WikipediaWeekendTirana2015_SuhaReka_101-2.jpg?width=900'
    ELSE image_url
END;
