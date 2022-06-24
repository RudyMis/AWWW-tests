# Testy

Zadanie z testów polega na napisaniu testów, które faktycznie sprawdzają, że aplikacja -
ta z 13 lub 14 zajęć - działa poprawnie, a nie tylko na napisaniu przykładowych testów z różnych kategorii.

## Testy bazy danych

### Generalne

- [x] Co się dzieje gdy baza danych nie posiada odpowiednich tablic?
- [x] Co się dzieje gdy baza danych ma tablicę o poprawnej nazwie, ale brakuje jej kolumn?

### Dodawanie

- [x] Czy możemy dodać wycieczkę o niedodatniej liczbie miejsc?
- [x] Czy możemy dodać wycieczkę, której data początku będzie później niż data końca?
- [x] Czy możemy dodać wycieczkę z niedodatnią ceną?
- [x] Czy któreś pole wycieczki może być puste?

- [x] Czy możemy dodać rezerwacje z liczbą osób większą niż 4 lub niedodatnią?
- [x] Czy któreś pole może być puste?
- [x] Co się dzieje jak spróbujemy dodać rezerwację z większą ilością osób niż jest wolnych miejsc?

- [x] Czy możemy dodać dwóch użytkowników z tym samym mailem?

### Pobieranie danych

- [x] Czy dostaniemy tylko wycieczki które się jeszcze nie zaczęły?
- [x] Czy dostaniemy niezaakceptowane rezerwacje prosząc o wycieczkę/użytkownika?

- [x] Co jak próbujemy zdobyć wycieczki/rezerwacje/użytkownika o niepoprawnym id?
- [x] Czy po wrzuceniu i pobraniu rezerwacji dostaniemy te same dane?

### Użytkownik (chai-http)

- [x] Czy można się zarejestrować
- [x] Co jak podamy nieodpowiednie hasło użytkownika?
- [x] Czy można się zalogować
- [x] Czy po zalogowaniu jest przekierowanie na stronę użytkownika?

### Frontend

- [x] Czy dane wycieczki się zgadzają z backendem?
- [x] Czy można zarezerwować wycieczkę z nielegalnymi danymi?
- [x] Czy można się zarejestrować na ten sam mail
- [x] Czy po logowaniu wchodząc na stronę logowania przenosi nas na stronę użytkownika
- [x] Czy po zalogowaniu i zarezerwowaniu wycieczki widać ją w naszych wycieczkach
- [x] Czy można się wylogować
