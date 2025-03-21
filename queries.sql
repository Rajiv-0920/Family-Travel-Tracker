CREATE TABLE visited_countries (
  id SERIAL PRIMARY KEY,
  country_code char(2),
  user_id INTEGER,
  UNIQUE(country_code, user_id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color char(7) NOT NULL 
);

CREATE TABLE countries_ (
  id SERIAL PRIMARY KEY,
  country_name VARCHAR(50) NOT NULL,
  country_code CHAR(2) NOT NULL
);