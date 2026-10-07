import sys

with open('js/virtual-trips.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        if (card) {
          const trip = vtrips.find(t => t.id === card.dataset.id);
          window.location.href = 'shared_trip.html?id=' + card.dataset.id;
        }"""

replacement = """        if (card) {
          const trip = vtrips.find(t => t.id === card.dataset.id);
          window.location.href = 'shared_trip.html?id=' + card.dataset.id;
        }
      });
    }"""

content = content.replace(target, replacement)

with open('js/virtual-trips.js', 'w', encoding='utf-8') as f:
    f.write(content)

