FRUITHAUS WEBSITE - BEGINNER GUIDE
===================================

What you have
-------------
fruithaus-website/
  index.html        the page structure and text
  styles.css        colours, fonts, layout
  script.js         products, prices, order basket, WhatsApp
  images/           put your photos here
  README.txt        this file

The site uses only HTML, CSS and JavaScript. No installs needed.


1. SET UP IN VS CODE
--------------------
1. Unzip fruithaus-website.zip. You get a folder called "fruithaus-website".
2. Open VS Code. Choose File > Open Folder... and pick "fruithaus-website".
3. In the left Explorer panel you should see index.html, styles.css,
   script.js and an images folder.

If you are building the files by hand instead:
  - Create a folder called fruithaus-website.
  - Inside it create index.html, styles.css and script.js
    (hover over the Explorer panel and click the "New File" icon).
  - Create a folder called images (the "New Folder" icon).
  - Paste each file's contents into the matching file and save (Ctrl+S).


2. RUN THE WEBSITE
------------------
Option A (easiest): double-click index.html to open it in your browser.

Option B (best while editing, refreshes automatically):
  1. In VS Code open Extensions (square icon on the left).
  2. Search for "Live Server" (by Ritwick Dey) and click Install.
  3. Right-click index.html and choose "Open with Live Server".


3. ADD YOUR PHOTOS
------------------
Put these files inside the images folder, with exactly these names:

  fruithaus-products.jpg   the group photo of all four bottles (hero section)
  watermelon.jpg           Watermelon Fruit Juice
  pineapple.jpg            Pineapple Fruit Juice
  tigernut.jpg             Tigernut Milk
  zobo.jpg                 Zobo Fruit Drink

Tips:
  - Product photos look best portrait (4 wide by 5 tall), one bottle each.
  - The hero photo is shown in a tall arch shape, so keep the bottles
    near the middle-bottom of the photo.
  - Keep each file under about 400 KB so the site loads fast on phones.
    Free tool: squoosh.app

Optional lifestyle photos: add gallery-1.jpg to gallery-6.jpg to the images
folder (your bottles outdoors, on a table, in a hand). They appear as a photo
strip at the very bottom of the page. Missing ones are skipped, and with none
the strip does not appear. You can change the list in script.js (GALLERY).

How real the site looks depends mostly on these photos. Good, bright photos
of the real bottles in real settings make the biggest difference.

If a photo is missing, the site shows a simple coloured bottle placeholder
instead of a broken image. Nothing breaks.

To use a different file name, open script.js and change the "image" line for
that product, e.g.  image: "images/my-new-photo.jpg"
For the hero photo, open index.html and change the src="images/fruithaus-products.jpg"
line near the top of the hero section.


4. ADD YOUR WHATSAPP NUMBER (IMPORTANT)
---------------------------------------
Open script.js. Near the top you will see:

  const WHATSAPP_NUMBER = "ADD_YOUR_WHATSAPP_NUMBER";

Replace ADD_YOUR_WHATSAPP_NUMBER with your number in international format:
  - digits only
  - no plus sign, no spaces, no dashes
  - country code first, and drop the leading 0

Fictional example (NOT a real number): 2348012345678
So the line becomes:  const WHATSAPP_NUMBER = "2348012345678";

Until you do this, the order buttons show a message instead of opening
WhatsApp. Save the file and refresh the browser.


5. CHANGE PRICES, NAMES AND DESCRIPTIONS
----------------------------------------
Open script.js and find the block called PRODUCTS (near the top).
Each drink looks like this:

  {
    id: "watermelon",
    name: "Watermelon Fruit Juice",
    price: 2500,
    size: "50 cl",
    description: "...",
    ingredients: "",
    image: "images/watermelon.jpg",
    color: "#C8323C"
  },

- price: type numbers only, no commas or the naira sign (2500, not 2,500).
- ingredients: when you have the real list, type it between the quotes,
  e.g.  ingredients: "Your real ingredient list here",
  It then appears in the "Know your drink" section. While it is empty the
  site says the full list is coming soon. Do not guess ingredients.
- Keep the commas and quotation marks exactly as they are.
- Prices on the page, in the basket and in the WhatsApp message all come from
  this one block, so you only change them here.


6. TEST THE BASKET AND WHATSAPP MESSAGE
---------------------------------------
1. Scroll to "Our drinks". On Pineapple, press + until it shows 2, press
   "Add to Order". The button shows "Added" and the "Your order" count at the
   top changes to 2.
2. Add 1 Zobo. Add 1 more Pineapple: it should join the existing Pineapple
   line (making 3), not create a second line.
3. Click "Your order" at the top. Check:
   - each line shows quantity, unit price and subtotal
   - total bottles and product total are right (with the default prices,
     3 Pineapple + 1 Zobo = 4 bottles, N10,000)
   - + and - change the quantity, "Remove" deletes a line
   - "Empty order" clears everything
4. Refresh the page. Your order should still be there.
5. Empty the order: "Continue to WhatsApp" should be greyed out.
6. With items in the basket, click "Continue to WhatsApp". WhatsApp opens
   with the order message ready. Check it, but do not send it to a
   customer by mistake. Send it to yourself or a test contact.

The message looks like this:

  Hello Fruithaus! I'd like to place an order.

  1. Pineapple Fruit Juice - 3 bottles x N2,500 = N7,500
  2. Zobo Fruit Drink - 1 bottle x N2,500 = N2,500

  Total bottles: 4
  Product total: N10,000

  Please confirm availability and the delivery or pickup options. Thank you!

(The website uses the proper naira sign and a dash.)

Important: opening WhatsApp does not place or pay for an order. The customer
must send the message and you confirm it with them. No delivery fee is added
by the site.


6b. CHANGE COLOURS
------------------
Open styles.css. The colours are listed once at the very top, inside :root
(for example --green is the button green, --brown is the heading colour,
--charcoal is the footer). Change a hex code there and the whole site
updates. The small colour for each drink (used when its photo is
missing) is the "color" line for that product in script.js.


7. THINGS TO KNOW
-----------------
- The site contains no reviews, social media links, email address or phone
  number, because none were supplied. To add social links, find the
  "SOCIAL LINKS" comment in the footer of index.html.
- The order is saved only in the customer's own browser (localStorage).
- To publish the site online (for example on Vercel), upload the whole
  folder with index.html at the top level.

Brand: Fruithaus - nature pressed into perfection. Benin City, Nigeria.
