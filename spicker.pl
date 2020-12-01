#!/usr/bin/env perl

package webspicker;

use strict;
use warnings;
use utf8;

use Mojo::UserAgent;
use Mojolicious::Lite;

our $APIURL = 'https://spickerrr.piraten-tools.de/api/';

# ----------------------------------------------------
# Routing
# ----------------------------------------------------

get '/' => sub {
    # Übersichtsseite:
  my $c = shift;    
  $c->render(template => 'start');
};

post '/APIErrorHandler/:errorString' => sub {
  # Fehlerbehandlung: Wirf HTML aus.
  my $c = shift;
    
  $c->stash(APIURL => $APIURL);
  $c->stash(errortext => $c->stash('errorString'));
    
  $c->render(template => 'fehler_API');
};

post '/Parteitage' => sub {
  # AJAX-Anfrage: Liste der Parteitage
  my $c = shift;
    
  my $ua  = Mojo::UserAgent->new;
  my $url = "${APIURL}currentbooks";

  $c->render(json => $ua->get($url)->result->json);
};

post '/Parteitag/:parteitag' => sub {
  # AJAX-Anfrage: Liste der Anträge
  my $c = shift;
  my $parteitag = $c->stash('parteitag');
    
  if ($parteitag ne 'dummy') {    
    my $ua  = Mojo::UserAgent->new;
    my $url = "${APIURL}book/${parteitag}/motions";
        
    $c->render(json => $ua->get($url)->result->json);
  }
};

post '/Parteitag/:parteitag/Antrag/:antrag' => sub {
  # AJAX-Anfrage: Antrag :antrag für Parteitag :parteitag
  my $c = shift;
  my $parteitag = $c->stash('parteitag');
  my $antrag = $c->stash('antrag');
    
  if ($antrag ne 'dummy') {    
    my $ua       = Mojo::UserAgent->new;
    my $url      = "${APIURL}book/${parteitag}/motions";
    my $antraege = $ua->get($url)->result->json;
        
    my $needle_location = -1;
        
    while (my ($idx, $elem) = each(@{$antraege})) {
      if ($elem->{'id'} eq $antrag) {
        $needle_location = $idx;
        last;
      }
    }
        
    # Der gesuchte Antrag steht jetzt in $antraege->[$needle_location].
    # Aufbereiten für die Anzeige:
    my $antrag = $antraege->[$needle_location];
        
    # Im Antragstext könnten Wikilinks drin sein. Bäh ... :-)
    my $antragstext = $antrag->{text};
    $antragstext =~ s/<a href="(\\)?\//<a href="https:\/\/wiki.piratenpartei.de\//g;
        
    # Der Link zum Autor ist vermutlich auch falsch.
    my $author = $antrag->{author};
    $author =~ s/<a href="(\/)?Benutzer:/<a target="_blank" href="https:\/\/wiki.piratenpartei.de\/Benutzer:/g;
        
    $c->content_for(author => $author);
    $c->stash(origlink => $antrag->{url});
    $c->stash(antragsid => $antrag->{id});
    $c->stash(title => $antrag->{title});
    $c->content_for(antrag => $antragstext);
    $c->content_for(begruendung => $antrag->{remarks});
        
    $c->render(template => 'antrag');
  }
};

app->start;
