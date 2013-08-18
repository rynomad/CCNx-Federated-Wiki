# Functions to manage NDN Interfaces, register prefixes, and express interests
repo = require './repository.coffee'

window.interfaces = {}
interfaces.faces = {}
interfaces.list = []
interfaces.active = []

interestHandler = (face, upcallInfo) ->
  #logic goes here
  sendData = (data) -> 
    signed = new SignedInfo()
    sent = false
    if interest.matches_name(new Name(interest.name.to_uri() + '/' + data.version)) == true && sent == false
      co = new ContentObject(new Name(upcallInfo.interest.name.to_uri() + '/' + data.version), signed, JSON.stringify(data), new Signature())
      console.log co
      co.signedInfo.freshnessSeconds = 604800
      co.sign()
      upcallInfo.contentObject = co
      face.transport.send(encodeToBinaryContentObject(upcallInfo.contentObject))
  contentStore = DataUtils.toString(upcallInfo.interest.name.components[face.prefix.components.length])
  console.log 'iiiiiiiiiiiiiiiiiiiiiiiii', upcallInfo.interest
  interest = upcallInfo.interest
  
  if contentStore == 'page'
    if DataUtils.toString(upcallInfo.interest.name.components[face.prefix.components.length + 1]) == 'update'
      slug = DataUtils.toString(upcallInfo.interest.name.components[face.prefix.components.length + 2])
      console.log face.prefixURI
    else
      console.log 'getting page'
      pI = {}
      pI.slug = DataUtils.toString(upcallInfo.interest.name.components[face.prefix.components.length + 1])
      repo.getPage(pI , sendData)
  else if contentStore == 'system'
    if DataUtils.toString(upcallInfo.interest.name.components[face.prefix.components.length + 1]) == 'sitemap.json'
      repo.getSitemap(sendData)
      
interfaces.registerFace = (url) ->
  face = new NDN({host: url})
  hostPrefix = ''
  hostComponents = url.split('.')
  for component in hostComponents
    if component != 'www' && component != 'http://www' && component != 'http://'
      hostPrefix = "/#{component}" + hostPrefix
  prefix = new Name(hostPrefix)
  face.prefixURI = hostPrefix
  face.prefix = prefix
  interfaces.faces[hostPrefix] = face
  interfaces.faces[hostPrefix].registerPrefix(prefix, (new interfaceClosure(face, interestHandler)))
  interfaces.list.push(hostPrefix)
  interfaces.active.push(interfaces.faces[hostPrefix])
